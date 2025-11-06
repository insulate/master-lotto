import { ChevronLeft, Crown, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import lotteryService from './lotteryService';
import toast from 'react-hot-toast';
import { parseErrorMessage } from '../../lib/utils';

/**
 * Home Page - หน้าแสดงรายการหวยทั้งหมด
 */
const HomePage = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lotteryTypes, setLotteryTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to map lottery type values to country codes
  const getCountryCode = (value) => {
    const countryMap = {
      'government': 'th',
      'lao_pattana': 'la',
      'hanoi_regular': 'vn',
      'hanoi_vip': 'vn'
    };
    return countryMap[value] || 'th';
  };

  // Fetch lottery types and open draws from API
  const fetchLotteryTypes = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch open lottery draws (includes lottery types and their latest open draw)
      const response = await lotteryService.getOpenLotteryDraws();
      const results = response.data.results || [];

      // Format data for display
      const items = results.map(result => {
        const type = result.lotteryType;
        const draw = result.draw;
        const hasOpenDraw = result.hasOpenDraw;

        // Determine status and display info
        let status = 'closed';
        let subName = 'ปิดรับแทง';
        let closingTime = '-';
        let round = null;

        if (hasOpenDraw && draw) {
          status = draw.status; // 'open', 'closed', 'completed'

          // Format draw date and closing time
          const drawDate = new Date(draw.draw_date);
          closingTime = drawDate.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });

          if (draw.status === 'open') {
            subName = null;
            round = draw.round_number ? `รอบที่ ${draw.round_number}` : null;
          } else if (draw.status === 'closed') {
            subName = 'ปิดรับแทง';
          } else if (draw.status === 'completed') {
            subName = 'ประกาศผลแล้ว';
          }
        }

        return {
          id: type.value,
          name: type.label,
          subName,
          round,
          status,
          closingTime,
          country: getCountryCode(type.value),
          vip: type.value === 'hanoi_vip',
          icon: type.icon,
          draw: draw // Keep full draw data for later use
        };
      });

      setLotteryTypes([
        {
          id: 1,
          name: 'หวยทั้งหมด',
          items
        }
      ]);
    } catch (err) {
      toast.error(parseErrorMessage(err));
      setLotteryTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch lottery types on mount
  useEffect(() => {
    fetchLotteryTypes();
  }, [fetchLotteryTypes]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCountryFlag = (country) => {
    const flags = {
      de: '🇩🇪',
      gb: '🇬🇧',
      ru: '🇷🇺',
      jp: '🇯🇵',
      in: '🇮🇳',
      th: '🇹🇭',
      pk: '🇵🇰',
      my: '🇲🇾',
      sg: '🇸🇬',
      vn: '🇻🇳',
      id: '🇮🇩',
      mm: '🇲🇲',
      la: '🇱🇦',
      kh: '🇰🇭',
      cn: '🇨🇳',
    };
    return flags[country] || '';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8">
        <div className="w-[800px]">
          <div className="bg-white border-2 border-primary-gold/30 rounded-xl shadow-2xl p-6">
            <div className="text-center py-12">
              <div className="text-primary-gold text-lg">กำลังโหลด...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="w-[800px]">
        {/* Main Card */}
        <div className="bg-white border-2 border-primary-gold/30 rounded-xl shadow-2xl p-6">
          {/* Current Time Display */}
          <div className="flex items-center justify-center gap-3 mb-6 pb-4 border-b-2 border-primary-gold/20">
            <Clock className="w-6 h-6 text-primary-gold" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-dark-gold">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-bg-dark/70 mt-1">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>

          {/* Lottery Sections */}
          <div className="space-y-8">
        {lotteryTypes.map((section) => (
          <div key={section.id}>
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4">
              {section.id === 1 ? (
                <Crown className="w-5 h-5 text-primary-gold" />
              ) : section.id === 2 ? (
                <Star className="w-5 h-5 text-primary-gold" />
              ) : (
                <Star className="w-5 h-5 text-primary-dark-gold" />
              )}
              <h2 className="text-bg-dark text-lg font-bold">{section.name}</h2>
            </div>

            {/* Lottery Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              {section.items.map((lottery) => (
                <button
                  key={lottery.id}
                  onClick={() => lottery.status === 'open' && navigate(`/app/betting/${lottery.id}`)}
                  disabled={lottery.status === 'closed'}
                  className={`relative p-4 rounded-xl text-left transition-all ${
                    lottery.status === 'open'
                      ? 'bg-gradient-to-br from-primary-light-gold/30 to-primary-gold/40 hover:from-primary-gold/40 hover:to-primary-dark-gold/50 border-2 border-primary-gold/60 shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-100 border-2 border-gray-300 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* VIP Badge */}
                  {lottery.vip && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-primary-dark-gold text-white text-xs font-bold px-2 py-1 rounded border border-primary-dark-gold">
                        VIP
                      </span>
                    </div>
                  )}

                  {/* Status Badge */}
                  {!lottery.vip && (
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        lottery.status === 'open'
                          ? 'bg-primary-dark-gold/80 text-white border border-primary-dark-gold'
                          : 'bg-gray-200 text-gray-500 border border-gray-300'
                      }`}>
                        {lottery.status === 'open' ? 'เปิดรับ' : 'ปิดรับ'}
                      </span>
                    </div>
                  )}

                  {/* Country Flag */}
                  {lottery.country && (
                    <div className="text-2xl mb-2">{getCountryFlag(lottery.country)}</div>
                  )}

                  {/* Lottery Name */}
                  <h3 className={`text-lg font-bold mb-1 pr-16 ${
                    lottery.status === 'open'
                      ? 'text-bg-dark'
                      : 'text-gray-400'
                  }`}>
                    {lottery.name}
                  </h3>

                  {/* Round/Subtitle */}
                  <div className={`text-2xl font-bold mb-1 ${
                    lottery.status === 'open'
                      ? 'text-primary-dark-gold'
                      : 'text-gray-400'
                  }`}>
                    {lottery.round || lottery.subName}
                  </div>

                  {/* Closing Time */}
                  <div className={`text-sm ${
                    lottery.status === 'open'
                      ? 'text-bg-dark/70'
                      : 'text-gray-400'
                  }`}>
                    ปิดรับ {lottery.closingTime}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
