import { Crown, Star, Clock, Home, FileText, Key } from 'lucide-react';
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
        box-shadow: 0 0 8px rgba(34, 197, 94, 0.6), 0 0 12px rgba(22, 163, 74, 0.4);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 0 12px rgba(34, 197, 94, 0.8), 0 0 20px rgba(22, 163, 74, 0.6);
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
  const fetchLotteryTypes = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

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
          draw: draw, // Keep full draw data for later use
          result: draw?.result || null // Add result data
        };
      });

      // Sort items: open first, then waiting, then closed
      const sortedItems = items.sort((a, b) => {
        // Define priority: open = 0, waiting (รอเปิด) = 1, closed = 2
        const getPriority = (item) => {
          if (item.status === 'open') return 0;
          if (item.subName === 'รอเปิด') return 1;
          return 2;
        };

        return getPriority(a) - getPriority(b);
      });

      setLotteryTypes([
        {
          id: 1,
          name: 'หวยทั้งหมด',
          items: sortedItems
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
    initSocket();

    // Handle lottery updates
    const handleLotteryUpdate = (data) => {
      console.log('📡 Received lottery update:', data);
      // Refetch lottery types when update received (silent = no loading)
      fetchLotteryTypes(true);
    };

    // Listen for lottery updates
    onLotteryUpdate(handleLotteryUpdate);

    // Cleanup
    return () => {
      offLotteryUpdate(handleLotteryUpdate);
    };
  }, [fetchLotteryTypes]);

  // Update time every second and check if need to refetch
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());

      // Check if any lottery's countdown has just reached 0 or passed it
      const needsRefetch = lotteryTypes.some(section =>
        section.items?.some(lottery => {
          if (lottery.countdownTime) {
            const now = new Date();
            const target = new Date(lottery.countdownTime);
            const diff = target - now;
            // If countdown is within 3 seconds of reaching 0 or just passed 0, refetch
            return diff > -1000 && diff <= 3000;
          }
          return false;
        })
      );

      if (needsRefetch) {
        console.log('🔄 Auto-refetching due to countdown reaching 0');
        fetchLotteryTypes(true); // Silent refetch
      }
    }, 1000);

    // Also refetch lottery types every minute as backup
    const refetchTimer = setInterval(() => {
      fetchLotteryTypes(true); // Silent refetch
    }, 60000); // 60 seconds

    return () => {
      clearInterval(timer);
      clearInterval(refetchTimer);
    };
  }, [fetchLotteryTypes, lotteryTypes]);

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

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="flex items-center justify-center pt-40">
        <div className="w-[800px]">
          <div className="bg-white border-2 border-primary-gold/30 rounded-xl shadow-2xl p-6 overflow-hidden">
            {/* Skeleton Clock */}
            <div className="flex items-center justify-center gap-3 mb-6 pb-4 border-b-2 border-primary-gold/20">
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="text-center">
                <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </div>
            </div>

            {/* Skeleton Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="relative p-4 rounded-xl bg-gray-100 border-2 border-gray-200 h-32"
                >
                  {/* Badge skeleton */}
                  <div className="absolute top-3 right-3 w-12 h-6 bg-gray-200 rounded animate-pulse"></div>

                  {/* Flag skeleton */}
                  <div className="w-8 h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>

                  {/* Name skeleton */}
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>

                  {/* Time skeleton */}
                  <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
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

      <div className="flex items-center justify-center pt-40">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.items.map((lottery) => (
                <button
                  key={lottery.id}
                  onClick={() => lottery.status === 'open' && lottery.draw?._id && navigate(`/app/betting/${lottery.draw._id}`)}
                  disabled={lottery.status === 'closed'}
                  className={`relative p-4 rounded-xl text-left transition-all ${
                    lottery.status === 'open'
                      ? 'bg-gradient-to-br from-primary-light-gold/30 to-primary-gold/40 hover:from-primary-gold/40 hover:to-primary-dark-gold/50 border-2 border-primary-gold/60 shadow-lg hover:shadow-xl transform hover:scale-105'
                      : lottery.status === 'completed'
                      ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 cursor-default'
                      : 'bg-gray-100 border-2 border-gray-300 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Status Badge */}
                  <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded ${
                    lottery.status === 'open'
                      ? 'bg-green-500/90 text-white border border-green-600 badge-pulse-glow'
                      : lottery.status === 'completed'
                      ? 'bg-emerald-500/90 text-white border border-emerald-600'
                      : lottery.subName === 'รอเปิด'
                      ? 'bg-blue-500/80 text-white border border-blue-600'
                      : 'bg-red-500/90 text-white border border-red-600'
                  }`}>
                    {lottery.status === 'open'
                      ? 'เปิดรับ'
                      : lottery.status === 'completed'
                      ? 'ประกาศผล'
                      : lottery.subName === 'รอเปิด'
                      ? 'รอเปิด'
                      : 'ปิดรับ'}
                  </span>

                  {/* Country Flag */}
                  {lottery.country && (
                    <div className="text-2xl mb-2">{getCountryFlag(lottery.country)}</div>
                  )}

                  {/* Lottery Name */}
                  <h3 className={`text-lg font-bold mb-1 pr-16 ${
                    lottery.status === 'open'
                      ? 'text-bg-dark'
                      : lottery.status === 'completed'
                      ? 'text-emerald-700'
                      : 'text-gray-400'
                  }`}>
                    {lottery.name}
                  </h3>

                  {/* Round/Subtitle */}
                  <div className={`text-2xl font-bold mb-1 ${
                    lottery.status === 'open'
                      ? 'text-primary-dark-gold'
                      : lottery.status === 'completed'
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                  }`}>
                    {lottery.round || ''}
                  </div>

                  {/* Result Display (if completed) */}
                  {lottery.status === 'completed' && lottery.result ? (
                    <div className="mt-2 space-y-1">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {lottery.result.three_top && (
                          <div className="bg-primary-gold/20 px-2 py-1 rounded">
                            <span className="text-gray-600">3 ตัวบน:</span>{' '}
                            <span className="font-bold text-primary-dark-gold">{lottery.result.three_top}</span>
                          </div>
                        )}
                        {lottery.result.three_bottom && (
                          <div className="bg-primary-gold/20 px-2 py-1 rounded">
                            <span className="text-gray-600">3 ตัวล่าง:</span>{' '}
                            <span className="font-bold text-primary-dark-gold">{lottery.result.three_bottom}</span>
                          </div>
                        )}
                        {lottery.result.two_top && (
                          <div className="bg-primary-gold/20 px-2 py-1 rounded">
                            <span className="text-gray-600">2 ตัวบน:</span>{' '}
                            <span className="font-bold text-primary-dark-gold">{lottery.result.two_top}</span>
                          </div>
                        )}
                        {lottery.result.two_bottom && (
                          <div className="bg-primary-gold/20 px-2 py-1 rounded">
                            <span className="text-gray-600">2 ตัวล่าง:</span>{' '}
                            <span className="font-bold text-primary-dark-gold">{lottery.result.two_bottom}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Closing Time / Countdown */
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
                  )}
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
