import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import memberService from '../members/memberService';
import lotteryTypeService from '../lottery-types/lotteryTypeService';
import PageHeader from '../../../components/common/PageHeader';
import { parseErrorMessage } from '../../../lib/utils';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

/**
 * Member Commission Management Page
 * หน้าจัดการค่าคอมมิชชันของผู้เล่นสำหรับ Agent
 */
const MemberCommissionPage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // State Management
  const [member, setMember] = useState(null);
  const [lotteryTypes, setLotteryTypes] = useState([]);
  const [commissionRates, setCommissionRates] = useState([]);
  const [expandedTypes, setExpandedTypes] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch member and lottery types on component mount
  useEffect(() => {
    fetchData();
  }, [memberId]);

  // Fetch member and lottery types
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch member data
      const membersResponse = await memberService.getAll();
      const foundMember = membersResponse.data.members.find((m) => m._id === memberId);

      if (!foundMember) {
        toast.error('ไม่พบข้อมูลผู้เล่น');
        navigate('/agent/members');
        return;
      }

      setMember(foundMember);

      // Fetch lottery types
      const lotteryResponse = await lotteryTypeService.getAll();
      const types = lotteryResponse.data.lotteryTypes || [];
      setLotteryTypes(types);

      // Initialize commission rates
      const rates = types.map((type) => {
        const existingRate = foundMember.commission_rates?.find(
          (rate) => rate.lottery_type_id === type._id
        );

        return {
          lottery_type_id: type._id,
          rates: existingRate?.rates || {
            three_top: 0,
            three_tod: 0,
            two_top: 0,
            two_bottom: 0,
            run_top: 0,
            run_bottom: 0,
          },
        };
      });
      setCommissionRates(rates);

      // Auto-expand first lottery type
      if (types.length > 0) {
        setExpandedTypes({ [types[0]._id]: true });
      }
    } catch (err) {
      toast.error(parseErrorMessage(err));
      navigate('/agent/members');
    } finally {
      setLoading(false);
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);
      const updateData = {
        commission_rates: commissionRates.map((rate) => ({
          lottery_type_id: rate.lottery_type_id,
          rates: {
            three_top: rate.rates.three_top || 0,
            three_tod: rate.rates.three_tod || 0,
            two_top: rate.rates.two_top || 0,
            two_bottom: rate.rates.two_bottom || 0,
            run_top: rate.rates.run_top || 0,
            run_bottom: rate.rates.run_bottom || 0,
          },
        })),
      };
      await memberService.update(memberId, updateData);
      toast.success(`อัพเดทค่าคอมมิชชันผู้เล่น ${member.username} สำเร็จ`);
      navigate('/agent/members');
    } catch (err) {
      toast.error(parseErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-primary-gold"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <PageHeader
        title="จัดการค่าคอมมิชชัน"
        subtitle={`ผู้เล่น: ${member.name} (${member.username})`}
        leftContent={
          <button
            onClick={() => navigate('/agent/members')}
            className="px-4 py-2 bg-[#6c757d] hover:bg-[#5a6268] text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
          >
            <ArrowLeft size={18} />
            <span>ย้อนกลับ</span>
          </button>
        }
      />

      {/* Member Info Card */}
      <div className="bg-bg-card rounded-lg p-6 mb-6 border border-border-default shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-text-secondary mb-1">Username</p>
            <p className="font-semibold text-text-primary">{member.username}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-1">ชื่อ-นามสกุล</p>
            <p className="font-semibold text-text-primary">{member.name}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-1">สถานะ</p>
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                member.status === 'active'
                  ? 'bg-accent-success/10 text-accent-success border border-accent-success'
                  : 'bg-accent-error/10 text-accent-error border border-accent-error'
              }`}
            >
              {member.status === 'active' ? 'ใช้งาน' : 'ระงับ'}
            </span>
          </div>
        </div>
      </div>

      {/* Commission Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-bg-card rounded-lg p-6 border border-border-default shadow-md">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            ตั้งค่าอัตราค่าคอมมิชชัน (%)
          </h2>

          <p className="text-sm text-text-muted mb-6">
            กรุณากำหนดอัตราค่าคอมมิชชันสำหรับแต่ละประเภทหวยและแต่ละประเภทเดิมพัน
          </p>

          <div className="space-y-4">
            {lotteryTypes.map((lotteryType) => {
              const rateIndex = commissionRates.findIndex(
                (r) => r.lottery_type_id === lotteryType._id
              );
              const isExpanded = expandedTypes[lotteryType._id];

              return (
                <div
                  key={lotteryType._id}
                  className="border border-border-default rounded-lg overflow-hidden"
                >
                  {/* Header */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedTypes({
                        ...expandedTypes,
                        [lotteryType._id]: !isExpanded,
                      })
                    }
                    className="w-full px-6 py-4 bg-bg-light-cream hover:bg-bg-cream flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-gold rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">{lotteryType.label.charAt(0)}</span>
                      </div>
                      <span className="font-semibold text-text-primary text-lg">
                        {lotteryType.label}
                      </span>
                    </div>
                    <svg
                      className={`w-6 h-6 text-text-secondary transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Content */}
                  {isExpanded && rateIndex >= 0 && (
                    <div className="p-6 bg-bg-card border-t border-border-default">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 3 ตัวบน */}
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            3 ตัวบน
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={commissionRates[rateIndex].rates.three_top}
                              onChange={(e) => {
                                const newRates = [...commissionRates];
                                newRates[rateIndex].rates.three_top =
                                  parseFloat(e.target.value) || 0;
                                setCommissionRates(newRates);
                              }}
                              className="w-full px-4 py-3 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                              placeholder="0.00"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
                              %
                            </span>
                          </div>
                        </div>

                        {/* 3 ตัวโต๊ด */}
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            3 ตัวโต๊ด
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={commissionRates[rateIndex].rates.three_tod}
                              onChange={(e) => {
                                const newRates = [...commissionRates];
                                newRates[rateIndex].rates.three_tod =
                                  parseFloat(e.target.value) || 0;
                                setCommissionRates(newRates);
                              }}
                              className="w-full px-4 py-3 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                              placeholder="0.00"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
                              %
                            </span>
                          </div>
                        </div>

                        {/* 2 ตัวบน */}
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            2 ตัวบน
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={commissionRates[rateIndex].rates.two_top}
                              onChange={(e) => {
                                const newRates = [...commissionRates];
                                newRates[rateIndex].rates.two_top =
                                  parseFloat(e.target.value) || 0;
                                setCommissionRates(newRates);
                              }}
                              className="w-full px-4 py-3 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                              placeholder="0.00"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
                              %
                            </span>
                          </div>
                        </div>

                        {/* 2 ตัวล่าง */}
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            2 ตัวล่าง
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={commissionRates[rateIndex].rates.two_bottom}
                              onChange={(e) => {
                                const newRates = [...commissionRates];
                                newRates[rateIndex].rates.two_bottom =
                                  parseFloat(e.target.value) || 0;
                                setCommissionRates(newRates);
                              }}
                              className="w-full px-4 py-3 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                              placeholder="0.00"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
                              %
                            </span>
                          </div>
                        </div>

                        {/* วิ่งบน */}
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            วิ่งบน
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={commissionRates[rateIndex].rates.run_top}
                              onChange={(e) => {
                                const newRates = [...commissionRates];
                                newRates[rateIndex].rates.run_top =
                                  parseFloat(e.target.value) || 0;
                                setCommissionRates(newRates);
                              }}
                              className="w-full px-4 py-3 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                              placeholder="0.00"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
                              %
                            </span>
                          </div>
                        </div>

                        {/* วิ่งล่าง */}
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            วิ่งล่าง
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={commissionRates[rateIndex].rates.run_bottom}
                              onChange={(e) => {
                                const newRates = [...commissionRates];
                                newRates[rateIndex].rates.run_bottom =
                                  parseFloat(e.target.value) || 0;
                                setCommissionRates(newRates);
                              }}
                              className="w-full px-4 py-3 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                              placeholder="0.00"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-border-default">
            <button
              type="button"
              onClick={() => navigate('/agent/members')}
              disabled={submitLoading}
              className="px-6 py-3 bg-[#6c757d] text-white font-medium rounded-lg hover:bg-[#5a6268] transition-colors disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-6 py-3 bg-accent-success hover:bg-accent-success/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {submitLoading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              <Save size={18} />
              <span>{submitLoading ? 'กำลังบันทึก...' : 'บันทึกค่าคอมมิชชัน'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MemberCommissionPage;
