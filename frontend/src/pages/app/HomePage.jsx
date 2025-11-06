import { ChevronLeft, Crown, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

/**
 * Home Page - หน้าแสดงรายการหวยทั้งหมด
 */
const HomePage = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock lottery data - จะต้องเชื่อมต่อกับ API จริงในภายหลัง
  const lotteryTypes = [
    {
      id: 1,
      name: 'หวยทั้งหมด',
      items: [
        { id: 'gov-pat', name: 'หวยรัฐบาล', subName: 'ปิดรับแทง', status: 'closed', closingTime: '16:30', country: 'th' },
        { id: 'lao', name: 'ลาวพัฒนา', subName: 'ปิดรับแทง', status: 'closed', closingTime: '13:30', country: 'la' },
        { id: 'hanoi', name: 'ฮานอยปกติ', subName: 'ปิดรับแทง', status: 'closed', closingTime: '18:30', country: 'vn' },
        { id: 'hanoi-vip', name: 'ฮานอย VIP', round: '88 รอบ', vip: true, status: 'open', closingTime: '09:00', country: 'vn' },
      ]
    },
  ];

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
