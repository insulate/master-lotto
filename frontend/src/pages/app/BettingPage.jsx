import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Calculator, Delete, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import lotteryDrawService from './lotteryDrawService';
import betService from '../../services/betService';
import { parseErrorMessage } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

/**
 * Bet Item Row Component - Individual bet item with edit functionality
 */
const BetItemRow = ({ item, betType, index, lotteryDraw, handleRemoveBet, handleUpdateAmount }) => {
  const [editAmount, setEditAmount] = useState(item.amount.toString());

  const handleAmountChange = (e) => {
    const newValue = e.target.value;
    setEditAmount(newValue);

    const newAmount = parseFloat(newValue);
    const settings = lotteryDraw.bet_settings[betType];

    // Validate and update only if valid
    if (newAmount && newAmount > 0) {
      if (newAmount < settings.min_bet) {
        // Don't update if below minimum
        return;
      }
      if (newAmount > settings.max_bet) {
        // Don't update if above maximum
        return;
      }
      // Update immediately if valid
      handleUpdateAmount(betType, index, newAmount);
    }
  };

  const handleBlur = () => {
    // Revert to current amount if input is invalid
    const newAmount = parseFloat(editAmount);
    if (!newAmount || newAmount <= 0) {
      setEditAmount(item.amount.toString());
    }
  };

  return (
    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg text-primary-dark-gold">{item.number}</span>
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-600">x</span>
          <input
            type="number"
            value={editAmount}
            onChange={handleAmountChange}
            onBlur={handleBlur}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:border-primary-gold focus:outline-none"
            min={lotteryDraw.bet_settings[betType].min_bet}
            max={lotteryDraw.bet_settings[betType].max_bet}
          />
          <span className="text-sm text-gray-600">฿</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-green-600 font-semibold">
          {item.potential_win.toLocaleString()} ฿
        </span>
        <button
          onClick={() => handleRemoveBet(betType, index)}
          className="text-red-500 hover:text-red-600 p-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/**
 * Summary Content Component - Reusable for both Desktop and Mobile
 */
const SummaryContent = ({
  betItems,
  betTypes,
  lotteryDraw,
  totalItems,
  totalAmount,
  handleSubmit,
  handleClearAll,
  handleRemoveBet,
  handleUpdateAmount,
  submitting,
  note,
  setNote,
  onClose = null, // Optional close function for mobile
}) => {
  return (
    <>
      {/* Totals */}
      <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl">
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600 font-medium">จำนวนเลข</span>
          <span className="font-bold text-xl">{totalItems}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600 font-medium">ยอดรวม</span>
          <span className="font-bold text-xl text-primary-dark-gold">
            {totalAmount.toLocaleString()} ฿
          </span>
        </div>
      </div>

      {/* All Bet Items by Type */}
      <div className="max-h-[400px] lg:max-h-[500px] overflow-y-auto">
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
                  <BetItemRow
                    key={index}
                    item={item}
                    betType={betTypeKey}
                    index={index}
                    lotteryDraw={lotteryDraw}
                    handleRemoveBet={handleRemoveBet}
                    handleUpdateAmount={handleUpdateAmount}
                  />
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
      </div>

      {/* Note Field */}
      {totalItems > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            หมายเหตุ (ถ้ามี)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={100}
            rows={2}
            placeholder="ใส่รายละเอียดของบิล (ไม่เกิน 100 ตัวอักษร)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-gold focus:outline-none resize-none"
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            {note.length}/100 ตัวอักษร
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 mt-6 pt-4 border-t-2 border-gray-200">
        <button
          onClick={() => {
            handleSubmit();
            if (onClose) onClose();
          }}
          disabled={totalItems === 0 || submitting}
          className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              กำลังแทง...
            </>
          ) : (
            'ยืนยันการแทง'
          )}
        </button>

        {totalItems > 0 && !submitting && (
          <button
            onClick={handleClearAll}
            className="w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
          >
            ลบทั้งหมด
          </button>
        )}
      </div>
    </>
  );
};

/**
 * Betting Page - หน้าแทงหวย
 */
const BettingPage = () => {
  const { lotteryId } = useParams();
  const navigate = useNavigate();
  const { getMe } = useAuthStore();

  // Lottery draw data
  const [lotteryDraw, setLotteryDraw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Bet Types - Grouped by digits
  const betTypeGroups = [
    {
      digits: 3,
      types: [
        { key: 'three_top', label: '3 ตัวบน' },
        { key: 'three_tod', label: '3 ตัวโต๊ด' },
      ]
    },
    {
      digits: 2,
      types: [
        { key: 'two_top', label: '2 ตัวบน' },
        { key: 'two_bottom', label: '2 ตัวล่าง' },
      ]
    },
    {
      digits: 1,
      types: [
        { key: 'run_top', label: 'วิ่งบน' },
        { key: 'run_bottom', label: 'วิ่งล่าง' },
      ]
    },
  ];

  // Flatten for backward compatibility
  const betTypes = betTypeGroups.flatMap(group =>
    group.types.map(type => ({ ...type, digits: group.digits }))
  );

  // Selected bet types (multiple selection)
  const [selectedBetTypes, setSelectedBetTypes] = useState(['three_top']);

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
  const [note, setNote] = useState('');

  // UI state for mobile
  const [showSummary, setShowSummary] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  // Input mode: 'keypad' or 'grid'
  const [inputMode, setInputMode] = useState('keypad');

  // For 3-digit grid: selected hundred digit (0-9)
  const [hundredDigit, setHundredDigit] = useState('0');

  // Current time for countdown
  const [currentTime, setCurrentTime] = useState(new Date());

  // Get selected bet types info
  const getSelectedBetTypes = () => {
    return betTypes.filter(bt => selectedBetTypes.includes(bt.key));
  };

  // Get current digit count based on selected types
  const getCurrentDigits = () => {
    const selected = getSelectedBetTypes();
    return selected.length > 0 ? selected[0].digits : 3;
  };

  // Get bet settings for a specific type
  const getBetSettings = (betType = null) => {
    if (!lotteryDraw) return { payout_rate: 0, min_bet: 1, max_bet: 1000, enabled: false };
    const type = betType || selectedBetTypes[0];
    return lotteryDraw.bet_settings[type];
  };

  // Toggle bet type selection
  const toggleBetType = (betTypeKey) => {
    const clickedType = betTypes.find(bt => bt.key === betTypeKey);
    if (!clickedType) return;

    // Check if already selected
    const isSelected = selectedBetTypes.includes(betTypeKey);

    if (isSelected) {
      // Deselect - but keep at least one selected
      if (selectedBetTypes.length > 1) {
        setSelectedBetTypes(selectedBetTypes.filter(key => key !== betTypeKey));
      }
    } else {
      // Check if any other type from same group is selected
      const currentDigits = getCurrentDigits();

      if (clickedType.digits === currentDigits) {
        // Same group - add to selection
        setSelectedBetTypes([...selectedBetTypes, betTypeKey]);
      } else {
        // Different group - replace with new selection
        setSelectedBetTypes([betTypeKey]);
      }
    }

    // Clear form
    setNumber('');
  };

  // Auto-add bet with default amount (1 baht)
  const autoAddBet = (numberToAdd) => {
    const defaultAmount = 1;

    // Check if number already exists in any selected type
    for (const betTypeKey of selectedBetTypes) {
      const existingItem = betItems[betTypeKey].find(item => item.number === numberToAdd);
      if (existingItem) {
        toast.error(`เลข ${numberToAdd} มีในรายการแล้ว`);
        setNumber('');
        return;
      }
    }

    // Add item to all selected types with default amount
    const updatedBetItems = { ...betItems };

    selectedBetTypes.forEach(betTypeKey => {
      const settings = getBetSettings(betTypeKey);
      const newItem = {
        number: numberToAdd,
        amount: defaultAmount,
        payout_rate: settings.payout_rate,
        potential_win: defaultAmount * settings.payout_rate,
      };
      updatedBetItems[betTypeKey] = [...updatedBetItems[betTypeKey], newItem];
    });

    setBetItems(updatedBetItems);

    // Clear number field
    setNumber('');

    // Success message
    if (selectedBetTypes.length === 1) {
      toast.success(`เพิ่มเลข ${numberToAdd} (${defaultAmount} บาท)`);
    } else {
      const typeLabels = selectedBetTypes.map(key =>
        betTypes.find(bt => bt.key === key).label
      ).join(', ');
      toast.success(`เพิ่มเลข ${numberToAdd} ให้ ${typeLabels} (${defaultAmount} บาท)`);
    }
  };

  // Remove bet item
  const handleRemoveBet = (betType, index) => {
    setBetItems({
      ...betItems,
      [betType]: betItems[betType].filter((_, i) => i !== index)
    });
    toast.success('ลบเลขเรียบร้อย');
  };

  // Update bet item amount
  const handleUpdateAmount = (betType, index, newAmount) => {
    const settings = getBetSettings(betType);
    const updatedItems = [...betItems[betType]];

    updatedItems[index] = {
      ...updatedItems[index],
      amount: newAmount,
      potential_win: newAmount * settings.payout_rate,
    };

    setBetItems({
      ...betItems,
      [betType]: updatedItems,
    });
  };

  // Clear all bets for selected types
  const handleClearSelectedTypes = () => {
    const updatedBetItems = { ...betItems };
    selectedBetTypes.forEach(betTypeKey => {
      updatedBetItems[betTypeKey] = [];
    });
    setBetItems(updatedBetItems);
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

  // Clear all bets silently (no toast)
  const clearAllSilently = () => {
    setBetItems({
      three_top: [],
      three_tod: [],
      two_top: [],
      two_bottom: [],
      run_top: [],
      run_bottom: [],
    });
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

  const { totalItems, totalAmount } = calculateTotals();

  // Fetch lottery draw on mount
  useEffect(() => {
    const fetchLotteryDraw = async () => {
      try {
        setLoading(true);
        const response = await lotteryDrawService.getDrawById(lotteryId);
        const draw = response.data.lotteryDraw;

        if (!draw) {
          toast.error('ไม่พบข้อมูลงวดหวย');
          navigate('/app/home');
          return;
        }

        // Check if draw is open
        const now = new Date();
        const openTime = new Date(draw.open_time);
        const closeTime = new Date(draw.close_time);

        if (draw.status !== 'open' || now < openTime || now >= closeTime) {
          toast.error('งวดหวยนี้ปิดรับแทงแล้ว');
          navigate('/app/home');
          return;
        }

        setLotteryDraw(draw);
      } catch (err) {
        toast.error(parseErrorMessage(err));
        navigate('/app/home');
      } finally {
        setLoading(false);
      }
    };

    fetchLotteryDraw();
  }, [lotteryId, navigate]);

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Submit bet
  const handleSubmit = async () => {
    if (totalItems === 0) {
      toast.error('กรุณาเพิ่มเลขก่อนยืนยันการแทง');
      return;
    }

    if (!lotteryDraw) {
      toast.error('ไม่พบข้อมูลงวดหวย');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare bet_items for API
      const apiBetItems = [];
      Object.keys(betItems).forEach(betType => {
        betItems[betType].forEach(item => {
          apiBetItems.push({
            bet_type: betType,
            number: item.number,
            amount: item.amount
          });
        });
      });

      // Call API
      const response = await betService.placeBet({
        lottery_draw_id: lotteryDraw._id,
        bet_items: apiBetItems,
        note: note.trim() || undefined // Send note if not empty
      });

      const { deducted, remaining } = response.data;

      // Update user balance in store
      await getMe();

      // Success
      toast.success(
        `แทงหวยสำเร็จ!\nตัดเครดิต ${deducted.total.toLocaleString()} บาท\nคงเหลือ ${remaining.total.toLocaleString()} บาท`,
        { duration: 5000 }
      );

      // Clear all bets and note after submit (silently)
      clearAllSilently();
      setNote('');
    } catch (err) {
      toast.error(parseErrorMessage(err), { duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  // Format time remaining
  const getTimeRemaining = () => {
    if (!lotteryDraw) return '-';

    const closeTime = new Date(lotteryDraw.close_time);
    const diff = closeTime - currentTime;

    if (diff <= 0) return 'ปิดรับแล้ว';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `เหลือ ${hours} ชม. ${minutes} นาที ${seconds} วินาที`;
  };

  // Keypad handlers
  const handleKeypadNumber = (digit) => {
    const maxDigits = getCurrentDigits();
    if (number.length < maxDigits) {
      const newNumber = number + digit;
      setNumber(newNumber);

      // Auto-add when number is complete
      if (newNumber.length === maxDigits) {
        // Auto-add with default amount of 1 baht
        setTimeout(() => {
          autoAddBet(newNumber);
        }, 100);
      }
    }
  };

  const handleKeypadBackspace = () => {
    setNumber(number.slice(0, -1));
  };

  const handleKeypadClear = () => {
    setNumber('');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-gold mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!lotteryDraw) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Compact */}
      <div className="sticky top-0 z-30 bg-white border-b-2 border-primary-gold/30 shadow-md lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/app/home')}
            className="text-primary-dark-gold hover:text-primary-gold transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-center px-4">
            <h1 className="text-lg font-bold text-primary-dark-gold truncate">
              {lotteryDraw.lottery_type_label || lotteryDraw.lottery_type}
            </h1>
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

      {/* Desktop Header */}
      <div className="hidden lg:block sticky top-0 z-30 bg-white border-b-2 border-primary-gold/30 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/app/home')}
            className="text-primary-dark-gold hover:text-primary-gold transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary-dark-gold">
              {lotteryDraw.lottery_type_label || lotteryDraw.lottery_type}
            </h1>
            <p className="text-sm text-gray-600">{getTimeRemaining()}</p>
          </div>
        </div>
      </div>

      {/* Main Layout - Desktop: Side-by-side, Mobile: Stacked */}
      <div className="lg:flex lg:gap-6 lg:container lg:mx-auto lg:px-4 lg:py-6">
        {/* Left Column: Betting Form */}
        <div className="lg:flex-1 pb-24 lg:pb-0">
          <div className="container mx-auto px-4 py-4 lg:p-0 max-w-2xl">
        {/* Main Content */}
        <div className="space-y-4">
          {/* Bet Type Selector - Single Row */}
          <div className="bg-white border-2 border-primary-gold/30 rounded-xl p-4 shadow-lg">
            <h2 className="text-sm font-bold text-primary-dark-gold mb-3">
              เลือกประเภท (เลือกได้หลายประเภท)
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
              {betTypes.map((betType) => {
                const isSelected = selectedBetTypes.includes(betType.key);
                const currentDigits = getCurrentDigits();
                const isDifferentGroup = betType.digits !== currentDigits;

                return (
                  <button
                    key={betType.key}
                    onClick={() => toggleBetType(betType.key)}
                    className={`py-2 px-1 rounded-lg font-semibold transition-all border-2 ${
                      isSelected
                        ? 'bg-primary-gold text-white border-primary-gold shadow-lg'
                        : isDifferentGroup
                        ? 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                        : 'bg-white text-gray-700 border-gray-300 active:bg-gray-50'
                    }`}
                  >
                    <div className="text-xs">{betType.label}</div>
                    <div className="text-xs mt-0.5 opacity-90">
                      x{lotteryDraw.bet_settings[betType.key].payout_rate}
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedBetTypes.length > 1 && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  กรอกเลข 1 ครั้ง จะแทงให้ทั้ง{' '}
                  <span className="font-bold">
                    {selectedBetTypes.map(key => betTypes.find(bt => bt.key === key).label).join(' และ ')}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Bet Form - Mobile Optimized */}
          <div className="bg-white border-2 border-primary-gold/30 rounded-xl p-4 shadow-lg">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setInputMode('keypad')}
                className={`py-3 rounded-lg font-semibold transition-all ${
                  inputMode === 'keypad'
                    ? 'bg-primary-gold text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calculator className="w-5 h-5 inline-block mr-2" />
                ระบบเลข
              </button>
              <button
                onClick={() => setInputMode('grid')}
                className={`py-3 rounded-lg font-semibold transition-all ${
                  inputMode === 'grid'
                    ? 'bg-primary-gold text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                เลือกเลข
              </button>
            </div>

            {inputMode === 'keypad' ? (
              <>
                {/* Number Display */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      กรอกเลข ({getCurrentDigits()} หลัก)
                    </label>
                    {selectedBetTypes.some(key => betItems[key].length > 0) && (
                      <button
                        onClick={handleClearSelectedTypes}
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
              </>
            ) : (
              <>
                {/* Grid Selection Mode */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      เลือกเลข ({getCurrentDigits()} หลัก)
                    </label>
                    {selectedBetTypes.some(key => betItems[key].length > 0) && (
                      <button
                        onClick={handleClearSelectedTypes}
                        className="text-red-500 active:text-red-600 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        ลบทั้งหมด
                      </button>
                    )}
                  </div>

                  {/* For 3 digits: Show hundred digit selector */}
                  {getCurrentDigits() === 3 && (
                    <div className="mb-3">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">เลือกหลักร้อย</label>
                      <div className="grid grid-cols-5 gap-1">
                        {Array.from({ length: 10 }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => setHundredDigit(i.toString())}
                            className={`py-2 rounded-lg font-bold text-sm transition-all ${
                              hundredDigit === i.toString()
                                ? 'bg-primary-gold text-white shadow-lg'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {i}00
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Number Grid */}
                {getCurrentDigits() === 1 ? (
                  // วิ่ง: แสดง 0-9 (10 ปุ่ม)
                  <div className="grid grid-cols-10 gap-1">
                    {Array.from({ length: 10 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => autoAddBet(i.toString())}
                        className="py-2 rounded-lg font-bold text-xs bg-white text-gray-800 hover:bg-primary-gold hover:text-white active:scale-95 border border-gray-300 transition-all"
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                ) : getCurrentDigits() === 2 ? (
                  // 2 หลัก: แสดง 00-99 (10 ปุ่มต่อแถว, ไม่มี scroll)
                  <div className="grid grid-cols-10 gap-1">
                    {Array.from({ length: 100 }, (_, i) => {
                      const num = i.toString().padStart(2, '0');
                      return (
                        <button
                          key={num}
                          onClick={() => autoAddBet(num)}
                          className="py-2 rounded-lg font-bold text-xs bg-white text-gray-800 hover:bg-primary-gold hover:text-white active:scale-95 border border-gray-300 transition-all"
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  // 3 หลัก: แสดง 000-999 ตามหลักร้อยที่เลือก (ไม่มี scroll)
                  <div className="grid grid-cols-10 gap-1">
                    {Array.from({ length: 100 }, (_, i) => {
                      const lastTwoDigits = i.toString().padStart(2, '0');
                      const fullNumber = hundredDigit + lastTwoDigits;
                      return (
                        <button
                          key={fullNumber}
                          onClick={() => autoAddBet(fullNumber)}
                          className="py-2 rounded-lg font-bold text-xs bg-white text-gray-800 hover:bg-primary-gold hover:text-white active:scale-95 border border-gray-300 transition-all"
                        >
                          {fullNumber}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}

          </div>

          {/* Selected Types Bet List */}
          {selectedBetTypes.some(key => betItems[key].length > 0) && (
            <div className="bg-white border-2 border-primary-gold/30 rounded-xl p-4 shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-700">
                  รายการเลขที่เลือก (
                  {selectedBetTypes.reduce((sum, key) => sum + betItems[key].length, 0)} เลข)
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
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedBetTypes.map((betTypeKey) => {
                    if (betItems[betTypeKey].length === 0) return null;

                    const betTypeInfo = betTypes.find(bt => bt.key === betTypeKey);

                    return (
                      <div key={betTypeKey}>
                        <h4 className="text-xs font-semibold text-gray-500 mb-1">
                          {betTypeInfo.label}
                        </h4>
                        <div className="space-y-2">
                          {betItems[betTypeKey].map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-primary-dark-gold">{item.number}</span>
                                <span className="text-xs text-gray-600">x {item.amount}฿</span>
                              </div>
                              <button
                                onClick={() => handleRemoveBet(betTypeKey, index)}
                                className="text-red-500 active:text-red-600 p-2"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
          </div>
        </div>

        {/* Right Column: Desktop Summary Sidebar - Always Visible on Desktop */}
        <div className="hidden lg:block lg:w-96">
          <div className="sticky top-24 bg-white border-2 border-primary-gold/30 rounded-xl shadow-lg p-4">
            {/* Summary Header */}
            <h2 className="text-xl font-bold text-primary-dark-gold flex items-center gap-2 mb-4 pb-3 border-b-2 border-primary-gold/30">
              <Calculator className="w-6 h-6" />
              รายการแทง
            </h2>

            {/* Summary Content - Reusable Component */}
            <SummaryContent
              betItems={betItems}
              betTypes={betTypes}
              lotteryDraw={lotteryDraw}
              totalItems={totalItems}
              totalAmount={totalAmount}
              handleRemoveBet={handleRemoveBet}
              handleUpdateAmount={handleUpdateAmount}
              handleClearAll={handleClearAll}
              handleSubmit={handleSubmit}
              submitting={submitting}
              note={note}
              setNote={setNote}
            />
          </div>
        </div>
      </div>

      {/* Summary Modal - Mobile Only */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center sm:justify-center lg:hidden">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b-2 border-primary-gold/30 px-4 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-primary-dark-gold flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                รายการแทง
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
              <SummaryContent
                betItems={betItems}
                betTypes={betTypes}
                lotteryDraw={lotteryDraw}
                totalItems={totalItems}
                totalAmount={totalAmount}
                handleRemoveBet={handleRemoveBet}
                handleUpdateAmount={handleUpdateAmount}
                handleSubmit={handleSubmit}
                handleClearAll={handleClearAll}
                submitting={submitting}
                note={note}
                setNote={setNote}
                onClose={() => setShowSummary(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BettingPage;

