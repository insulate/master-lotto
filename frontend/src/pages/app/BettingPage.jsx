import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Betting Page - หน้าแทงหวย (Mockup)
 */
const BettingPage = () => {
  const { lotteryId } = useParams();
  const navigate = useNavigate();

  // Mockup Data - งวดหวยที่เลือก
  const [lotteryDraw] = useState({
    id: lotteryId || 'government',
    name: 'หวยรัฐบาล',
    round: 'รอบที่ 123',
    draw_date: '2025-01-15T14:30:00',
    close_time: '2025-01-15T14:00:00',
    bet_settings: {
      three_top: { payout_rate: 900, min_bet: 1, max_bet: 10000, enabled: true },
      three_tod: { payout_rate: 150, min_bet: 1, max_bet: 10000, enabled: true },
      two_top: { payout_rate: 90, min_bet: 1, max_bet: 10000, enabled: true },
      two_bottom: { payout_rate: 90, min_bet: 1, max_bet: 10000, enabled: true },
      run_top: { payout_rate: 3, min_bet: 1, max_bet: 10000, enabled: true },
      run_bottom: { payout_rate: 3, min_bet: 1, max_bet: 10000, enabled: true },
    }
  });

  // Bet Types
  const betTypes = [
    { key: 'three_top', label: '3 ตัวบน', digits: 3 },
    { key: 'three_tod', label: '3 ตัวโต๊ด', digits: 3 },
    { key: 'two_top', label: '2 ตัวบน', digits: 2 },
    { key: 'two_bottom', label: '2 ตัวล่าง', digits: 2 },
    { key: 'run_top', label: 'วิ่งบน', digits: 1 },
    { key: 'run_bottom', label: 'วิ่งล่าง', digits: 1 },
  ];

  // Current bet type selection
  const [currentBetType, setCurrentBetType] = useState('three_top');

  // Bet items for current bet type
  const [betItems, setBetItems] = useState({
    three_top: [],
    three_tod: [],
    two_top: [],
    two_bottom: [],
    run_top: [],
    run_bottom: [],
  });

  // Form state
  const [number, setNumber] = useState('');
  const [amount, setAmount] = useState('');

  // Get current bet type info
  const getCurrentBetType = () => {
    return betTypes.find(bt => bt.key === currentBetType);
  };

  // Get bet settings for current type
  const getBetSettings = () => {
    return lotteryDraw.bet_settings[currentBetType];
  };

  // Add bet item
  const handleAddBet = () => {
    const betType = getCurrentBetType();
    const settings = getBetSettings();

    // Validation
    if (!number) {
      toast.error('กรุณากรอกเลข');
      return;
    }

    if (number.length !== betType.digits) {
      toast.error(`กรุณากรอกเลข ${betType.digits} หลัก`);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('กรุณากรอกจำนวนเงิน');
      return;
    }

    const amountNum = parseFloat(amount);

    if (amountNum < settings.min_bet) {
      toast.error(`ขั้นต่ำ ${settings.min_bet} บาท`);
      return;
    }

    if (amountNum > settings.max_bet) {
      toast.error(`สูงสุด ${settings.max_bet} บาท`);
      return;
    }

    // Check if number already exists
    const existingItem = betItems[currentBetType].find(item => item.number === number);
    if (existingItem) {
      toast.error('เลขนี้มีในรายการแล้ว');
      return;
    }

    // Add item
    const newItem = {
      number,
      amount: amountNum,
      payout_rate: settings.payout_rate,
      potential_win: amountNum * settings.payout_rate,
    };

    setBetItems({
      ...betItems,
      [currentBetType]: [...betItems[currentBetType], newItem]
    });

    // Clear form
    setNumber('');
    setAmount('');
    toast.success('เพิ่มเลขเรียบร้อย');
  };

  // Remove bet item
  const handleRemoveBet = (betType, index) => {
    setBetItems({
      ...betItems,
      [betType]: betItems[betType].filter((_, i) => i !== index)
    });
    toast.success('ลบเลขเรียบร้อย');
  };

  // Clear all bets for current type
  const handleClearCurrentType = () => {
    setBetItems({
      ...betItems,
      [currentBetType]: []
    });
    toast.success('ลบเลขทั้งหมดเรียบร้อย');
  };

  // Clear all bets
  const handleClearAll = () => {
    setBetItems({
      three_top: [],
      three_tod: [],
      two_top: [],
      two_bottom: [],
      run_top: [],
      run_bottom: [],
    });
    toast.success('ลบเลขทั้งหมดเรียบร้อย');
  };

  // Calculate totals
  const calculateTotals = () => {
    let totalItems = 0;
    let totalAmount = 0;
    let totalPotentialWin = 0;

    Object.keys(betItems).forEach(key => {
      betItems[key].forEach(item => {
        totalItems++;
        totalAmount += item.amount;
        totalPotentialWin += item.potential_win;
      });
    });

    return { totalItems, totalAmount, totalPotentialWin };
  };

  const { totalItems, totalAmount, totalPotentialWin } = calculateTotals();

  // Submit bet (mockup)
  const handleSubmit = () => {
    if (totalItems === 0) {
      toast.error('กรุณาเพิ่มเลขก่อนยืนยันการแทง');
      return;
    }

    // Mockup success
    toast.success('ยืนยันการแทงสำเร็จ! (Mockup)');

    // Clear all bets after submit
    setTimeout(() => {
      handleClearAll();
    }, 1000);
  };

  // Format time remaining
  const getTimeRemaining = () => {
    const now = new Date();
    const closeTime = new Date(lotteryDraw.close_time);
    const diff = closeTime - now;

    if (diff <= 0) return 'ปิดรับแล้ว';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `เหลือ ${hours} ชม. ${minutes} นาที ${seconds} วินาที`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/app/home')}
            className="flex items-center gap-2 text-primary-dark-gold hover:text-primary-gold mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>กลับหน้าหลัก</span>
          </button>

          <div className="bg-white border-2 border-primary-gold/30 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-primary-dark-gold mb-2">{lotteryDraw.name}</h1>
                <p className="text-lg font-semibold text-primary-gold mb-1">{lotteryDraw.round}</p>
                <p className="text-sm text-gray-600">วันออกผล: {new Date(lotteryDraw.draw_date).toLocaleString('th-TH')}</p>
              </div>
              <div className="text-right">
                <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm mb-2">
                  เปิดรับแทง
                </div>
                <p className="text-sm text-gray-600">{getTimeRemaining()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Bet Type Selector & Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bet Type Selector */}
            <div className="bg-white border-2 border-primary-gold/30 rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-primary-dark-gold mb-4">เลือกประเภทการแทง</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {betTypes.map((betType) => (
                  <button
                    key={betType.key}
                    onClick={() => setCurrentBetType(betType.key)}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                      currentBetType === betType.key
                        ? 'bg-primary-gold text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div>{betType.label}</div>
                    <div className="text-xs mt-1">
                      จ่าย {lotteryDraw.bet_settings[betType.key].payout_rate}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bet Form */}
            <div className="bg-white border-2 border-primary-gold/30 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-primary-dark-gold">
                  {getCurrentBetType().label}
                </h2>
                {betItems[currentBetType].length > 0 && (
                  <button
                    onClick={handleClearCurrentType}
                    className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    ลบทั้งหมด
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เลข ({getCurrentBetType().digits} หลัก)
                  </label>
                  <input
                    type="text"
                    value={number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= getCurrentBetType().digits) {
                        setNumber(value);
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-gold text-lg text-center font-bold"
                    placeholder={`ตัวอย่าง: ${'1'.repeat(getCurrentBetType().digits)}`}
                    maxLength={getCurrentBetType().digits}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    จำนวนเงิน (บาท)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-gold text-lg text-center font-bold"
                    placeholder="0"
                    min={getBetSettings().min_bet}
                    max={getBetSettings().max_bet}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    ขั้นต่ำ {getBetSettings().min_bet} - สูงสุด {getBetSettings().max_bet} บาท
                  </p>
                </div>

                <button
                  onClick={handleAddBet}
                  className="w-full bg-primary-gold hover:bg-primary-dark-gold text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  เพิ่มเลข
                </button>
              </div>

              {/* Current Type Bet List */}
              {betItems[currentBetType].length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">รายการเลข ({betItems[currentBetType].length})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {betItems[currentBetType].map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-primary-dark-gold">{item.number}</span>
                          <span className="text-sm text-gray-600">x {item.amount} บาท</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-green-600 font-semibold">
                            ถูกได้ {item.potential_win.toLocaleString()} บาท
                          </span>
                          <button
                            onClick={() => handleRemoveBet(currentBetType, index)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white border-2 border-primary-gold/30 rounded-xl p-6 shadow-lg sticky top-6">
              <h2 className="text-lg font-bold text-primary-dark-gold mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                สรุปการแทง
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">จำนวนเลข</span>
                  <span className="font-bold text-lg">{totalItems}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">ยอดรวม</span>
                  <span className="font-bold text-lg text-primary-dark-gold">
                    {totalAmount.toLocaleString()} บาท
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">ถูกได้สูงสุด</span>
                  <span className="font-bold text-lg text-green-600">
                    {totalPotentialWin.toLocaleString()} บาท
                  </span>
                </div>
              </div>

              {/* All Bet Items by Type */}
              {Object.keys(betItems).map((betTypeKey) => {
                if (betItems[betTypeKey].length === 0) return null;

                const betTypeInfo = betTypes.find(bt => bt.key === betTypeKey);
                const typeTotal = betItems[betTypeKey].reduce((sum, item) => sum + item.amount, 0);

                return (
                  <div key={betTypeKey} className="mb-4">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">
                      {betTypeInfo.label} ({betItems[betTypeKey].length} เลข - {typeTotal.toLocaleString()} บาท)
                    </h3>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {betItems[betTypeKey].map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-xs bg-gray-50 p-2 rounded"
                        >
                          <span className="font-bold">{item.number}</span>
                          <span className="text-gray-600">{item.amount} บาท</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="space-y-3 mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={totalItems === 0}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ยืนยันการแทง
                </button>

                {totalItems > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    ลบทั้งหมด
                  </button>
                )}
              </div>

              {/* Mockup Notice */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 text-center">
                  🚧 หน้านี้เป็น Mockup ยังไม่เชื่อมต่อ Backend
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BettingPage;
