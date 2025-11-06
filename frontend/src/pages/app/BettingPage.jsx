import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calculator, Delete, X, ChevronDown, ChevronUp } from 'lucide-react';
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

  // UI state for mobile
  const [showSummary, setShowSummary] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

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

  // Keypad handlers
  const handleKeypadNumber = (digit) => {
    const maxDigits = getCurrentBetType().digits;
    if (number.length < maxDigits) {
      setNumber(number + digit);
    }
  };

  const handleKeypadBackspace = () => {
    setNumber(number.slice(0, -1));
  };

  const handleKeypadClear = () => {
    setNumber('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Mobile Header - Compact */}
      <div className="sticky top-0 z-30 bg-white border-b-2 border-primary-gold/30 shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/app/home')}
            className="text-primary-dark-gold hover:text-primary-gold transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-center px-4">
            <h1 className="text-lg font-bold text-primary-dark-gold truncate">{lotteryDraw.name}</h1>
            <p className="text-xs text-gray-600">{getTimeRemaining()}</p>
          </div>
          <button
            onClick={() => setShowSummary(true)}
            className="bg-primary-gold text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1"
          >
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">สรุป</span>
            <span>({totalItems})</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-2xl">
        {/* Main Content */}
        <div className="space-y-4">
          {/* Bet Type Selector - Horizontal Scroll on Mobile */}
          <div className="bg-white border-2 border-primary-gold/30 rounded-xl p-4 shadow-lg">
            <h2 className="text-base font-bold text-primary-dark-gold mb-3">เลือกประเภท</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {betTypes.map((betType) => (
                <button
                  key={betType.key}
                  onClick={() => {
                    setCurrentBetType(betType.key);
                    setNumber('');
                    setAmount('');
                  }}
                  className={`flex-shrink-0 py-3 px-4 rounded-lg font-semibold transition-all min-w-[100px] ${
                    currentBetType === betType.key
                      ? 'bg-primary-gold text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                  }`}
                >
                  <div className="text-sm">{betType.label}</div>
                  <div className="text-xs mt-1 opacity-90">
                    x{lotteryDraw.bet_settings[betType.key].payout_rate}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bet Form - Mobile Optimized */}
          <div className="bg-white border-2 border-primary-gold/30 rounded-xl p-4 shadow-lg">
            {/* Number Display */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  กรอกเลข ({getCurrentBetType().digits} หลัก)
                </label>
                {betItems[currentBetType].length > 0 && (
                  <button
                    onClick={handleClearCurrentType}
                    className="text-red-500 active:text-red-600 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    ลบทั้งหมด
                  </button>
                )}
              </div>
              <div className="w-full px-4 py-6 border-4 border-primary-gold bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl text-5xl text-center font-bold text-primary-dark-gold min-h-[90px] flex items-center justify-center shadow-inner">
                {number || '---'}
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleKeypadNumber(digit.toString())}
                  className="bg-white active:bg-primary-gold active:text-white border-2 border-gray-300 rounded-lg py-3 text-2xl font-bold transition-all active:scale-95 shadow-sm hover:shadow-md"
                >
                  {digit}
                </button>
              ))}

              {/* Clear Button */}
              <button
                onClick={handleKeypadClear}
                className="bg-red-500 active:bg-red-600 text-white border-2 border-red-600 rounded-lg py-3 text-base font-bold transition-all active:scale-95 shadow-sm"
              >
                ล้าง
              </button>

              {/* Zero Button */}
              <button
                onClick={() => handleKeypadNumber('0')}
                className="bg-white active:bg-primary-gold active:text-white border-2 border-gray-300 rounded-lg py-3 text-2xl font-bold transition-all active:scale-95 shadow-sm hover:shadow-md"
              >
                0
              </button>

              {/* Backspace Button */}
              <button
                onClick={handleKeypadBackspace}
                className="bg-yellow-500 active:bg-yellow-600 text-white border-2 border-yellow-600 rounded-lg py-3 text-base font-bold transition-all active:scale-95 flex items-center justify-center shadow-sm"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Amount Input - Quick Buttons */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                จำนวนเงิน (บาท)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-gold text-2xl text-center font-bold mb-2"
                placeholder="0"
                min={getBetSettings().min_bet}
                max={getBetSettings().max_bet}
              />
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[10, 50, 100, 500].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="bg-gray-100 active:bg-gray-200 border border-gray-300 rounded-lg py-2 text-sm font-semibold text-gray-700"
                  >
                    {quickAmount}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                ขั้นต่ำ {getBetSettings().min_bet} - สูงสุด {getBetSettings().max_bet.toLocaleString()} บาท
              </p>
            </div>

            {/* Add Button - Prominent */}
            <button
              onClick={handleAddBet}
              className="w-full bg-gradient-to-r from-primary-gold to-primary-dark-gold active:from-primary-dark-gold active:to-primary-gold text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 text-lg"
            >
              <Plus className="w-6 h-6" />
              เพิ่มเลข
            </button>
          </div>

          {/* Current Type Bet List */}
          {betItems[currentBetType].length > 0 && (
            <div className="bg-white border-2 border-primary-gold/30 rounded-xl p-4 shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-700">
                  รายการเลข ({betItems[currentBetType].length})
                </h3>
                <button
                  onClick={() => setSummaryExpanded(!summaryExpanded)}
                  className="text-primary-gold text-sm font-semibold flex items-center gap-1"
                >
                  {summaryExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {summaryExpanded ? 'ซ่อน' : 'แสดง'}
                </button>
              </div>
              {summaryExpanded && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {betItems[currentBetType].map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary-dark-gold">{item.number}</span>
                        <span className="text-xs text-gray-600">x {item.amount}฿</span>
                      </div>
                      <button
                        onClick={() => handleRemoveBet(currentBetType, index)}
                        className="text-red-500 active:text-red-600 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Modal - Mobile */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center sm:justify-center">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b-2 border-primary-gold/30 px-4 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-primary-dark-gold flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                สรุปการแทง
              </h2>
              <button
                onClick={() => setShowSummary(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {/* Totals */}
              <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600 font-medium">จำนวนเลข</span>
                  <span className="font-bold text-xl">{totalItems}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600 font-medium">ยอดรวม</span>
                  <span className="font-bold text-xl text-primary-dark-gold">
                    {totalAmount.toLocaleString()} ฿
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">ถูกได้สูงสุด</span>
                  <span className="font-bold text-xl text-green-600">
                    {totalPotentialWin.toLocaleString()} ฿
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
                    <h3 className="text-sm font-bold text-gray-700 mb-2 bg-primary-gold/10 px-3 py-2 rounded-lg">
                      {betTypeInfo.label} ({betItems[betTypeKey].length} เลข - {typeTotal.toLocaleString()} ฿)
                    </h3>
                    <div className="space-y-2">
                      {betItems[betTypeKey].map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                        >
                          <div>
                            <span className="font-bold text-lg text-primary-dark-gold">{item.number}</span>
                            <span className="text-sm text-gray-600 ml-2">x {item.amount} ฿</span>
                          </div>
                          <span className="text-sm text-green-600 font-semibold">
                            {item.potential_win.toLocaleString()} ฿
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {totalItems === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>ยังไม่มีรายการเลข</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 mt-6 sticky bottom-0 bg-white pt-4">
                <button
                  onClick={() => {
                    handleSubmit();
                    setShowSummary(false);
                  }}
                  disabled={totalItems === 0}
                  className="w-full bg-green-500 active:bg-green-600 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  ยืนยันการแทง
                </button>

                {totalItems > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="w-full bg-red-500 active:bg-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
                  >
                    ลบทั้งหมด
                  </button>
                )}

                {/* Mockup Notice */}
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800 text-center">
                    🚧 หน้านี้เป็น Mockup ยังไม่เชื่อมต่อ Backend
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BettingPage;
