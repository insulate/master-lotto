import { ChevronLeft, Crown, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import lotteryService from './lotteryService';
import toast from 'react-hot-toast';
import { parseErrorMessage } from '../../lib/utils';
import { initSocket, onLotteryUpdate, offLotteryUpdate } from '../../lib/socket';

/**
 * Home Page - หน้าแสดงรายการหวยทั้งหมด
 */
const HomePage = () => {
  // Add CSS animation styles for the badge
  const pulseGlowStyles = `
    @keyframes pulse-glow {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 8px rgba(184, 134, 11, 0.6), 0 0 12px rgba(218, 165, 32, 0.4);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 0 12px rgba(184, 134, 11, 0.8), 0 0 20px rgba(218, 165, 32, 0.6);
      }
    }
    .badge-pulse-glow {
      animation: pulse-glow 2s ease-in-out infinite;
    }
  `;

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

  // Helper function to calculate time remaining until a specific time
  const getTimeRemaining = (targetTime) => {
    if (!targetTime) return null;

    const now = new Date();
    const target = new Date(targetTime);
    const diff = target - now;

    if (diff <= 0) return 'ปิดรับแล้ว';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      return `เหลือ ${days} วัน ${hours} ชม.`;
    } else if (hours > 0) {
      return `เหลือ ${hours} ชม. ${minutes} นาที ${seconds} วินาที`;
    } else {
      return `เหลือ ${minutes} นาที ${seconds} วินาที`;
    }
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
        let countdownTime = null; // Time to countdown to (open_time or close_time)

        if (hasOpenDraw && draw) {
          // Format draw date and closing time
          const drawDate = new Date(draw.draw_date);
          closingTime = drawDate.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });

          // Check if draw is open AND has reached open_time
          const now = new Date();
          const openTime = new Date(draw.open_time);
          const closeTime = new Date(draw.close_time);

          if (draw.status === 'open') {
            // Check if current time is before open_time
            if (now < openTime) {
              // Not yet open for betting - show countdown to open_time
              status = 'closed';
              subName = 'รอเปิด';
              countdownTime = draw.open_time;
            } else if (now >= closeTime) {
              // Past closing time but not yet marked as closed
              status = 'closed';
              subName = 'ปิดรับแทง';
            } else {
              // Open and accepting bets - show countdown to close_time
              status = 'open';
              subName = null;
              round = draw.round_number ? `รอบที่ ${draw.round_number}` : null;
              countdownTime = draw.close_time;
            }
          } else if (draw.status === 'closed') {
            status = 'closed';
            subName = 'ปิดรับแทง';
          } else if (draw.status === 'completed') {
            status = 'completed';
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
          countdownTime, // Add countdown time
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

  // Initialize WebSocket connection and listen for updates
  useEffect(() => {
    // Initialize socket
    const socket = initSocket();

    // Handle lottery updates
    const handleLotteryUpdate = (data) => {
      console.log('📡 Received lottery update:', data);
      // Refetch lottery types when update received
      fetchLotteryTypes();
    };

    // Listen for lottery updates
    onLotteryUpdate(handleLotteryUpdate);

    // Cleanup
    return () => {
      offLotteryUpdate(handleLotteryUpdate);
    };
  }, [fetchLotteryTypes]);

  // Update time every second and refetch lottery types every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Refetch lottery types every minute to update status
    const refetchTimer = setInterval(() => {
      fetchLotteryTypes();
    }, 60000); // 60 seconds

    return () => {
      clearInterval(timer);
      clearInterval(refetchTimer);
    };
  }, [fetchLotteryTypes]);

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
    <>
      {/* Inject animation styles */}
      <style>{pulseGlowStyles}</style>

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
                  {/* Status Badge */}
                  <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded ${
                    lottery.status === 'open'
                      ? 'bg-primary-dark-gold/80 text-white border border-primary-dark-gold badge-pulse-glow'
                      : 'bg-gray-200 text-gray-500 border border-gray-300'
                  }`}>
                    {lottery.status === 'open' ? 'เปิดรับ' : 'ปิดรับ'}
                  </span>

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

                  {/* Closing Time / Countdown */}
                  <div className={`text-sm ${
                    lottery.status === 'open'
                      ? 'text-bg-dark/70'
                      : 'text-gray-400'
                  }`}>
                    {lottery.countdownTime
                      ? getTimeRemaining(lottery.countdownTime)
                      : `ปิดรับ ${lottery.closingTime}`
                    }
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
    </>
  );
};

export default HomePage;
