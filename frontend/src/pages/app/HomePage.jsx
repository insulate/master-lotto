import { ChevronLeft, Crown, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Home Page - หน้าแสดงรายการหวยทั้งหมด
 */
const HomePage = () => {
  const navigate = useNavigate();

  // Mock lottery data - จะต้องเชื่อมต่อกับ API จริงในภายหลัง
  const lotteryTypes = [
    {
      id: 1,
      name: 'หวยรัฐบาล & ยี่กี VIP',
      items: [
        { id: 'gov-24', name: 'ยี่กี VIP 24 ชั่วโมง', round: '88 รอบ', vip: true, status: 'open', closingTime: '09:00' },
        { id: 'gov-pat', name: 'หวยรัฐบาล', subName: 'ปิดรับแทง', status: 'closed', closingTime: '16:30' },
        { id: 'gov-set', name: 'หวยเศรษฐี', subName: 'ปิดรับแทง', status: 'closed', closingTime: '09:00' },
      ]
    },
    {
      id: 2,
      name: 'หวยหุ้นไทย',
      items: [
        { id: 'stock-th', name: 'หุ้นไทยเย็น', subName: 'ปิดรับแทง', status: 'closed', closingTime: '16:20' },
      ]
    },
    {
      id: 3,
      name: 'หวยหุ้นต่างประเทศ',
      items: [
        { id: 'stock-cn', name: 'เยอรมัน', round: '4:23:46', status: 'open', closingTime: '22:00', country: 'de' },
        { id: 'stock-uk', name: 'อังกฤษ', round: '4:23:46', status: 'open', closingTime: '22:00', country: 'gb' },
        { id: 'stock-ru', name: 'รัสเซีย', round: '4:23:46', status: 'open', closingTime: '23:00', country: 'ru' },
        { id: 'stock-jp', name: 'ดาว VIP', round: '3:38:46', status: 'open', closingTime: '20:35', country: 'jp' },
        { id: 'stock-in', name: 'ฮั่งเส็ง', round: '0:23:46', status: 'open', closingTime: '18:00', country: 'in' },
        { id: 'stock-th2', name: 'ดาวโจนส์', round: '0:23:46', status: 'open', closingTime: '18:00', country: 'th' },
        { id: 'stock-pk', name: 'อินเดีย', subName: 'ปิดรับแทง', status: 'closed', closingTime: '16:20', country: 'pk' },
        { id: 'stock-my', name: 'ฮานอยพิเศษ', subName: 'ปิดรับแทง', status: 'closed', closingTime: '18:30', country: 'my' },
        { id: 'stock-sg', name: 'หุ้นกัมพูด', subName: 'ปิดรับแทง', status: 'closed', closingTime: '18:30', country: 'sg' },
        { id: 'stock-vn', name: 'ฮานอยปกติ', subName: 'ปิดรับแทง', status: 'closed', closingTime: '18:30', country: 'vn' },
        { id: 'stock-id', name: 'สิงคโปร์', subName: 'ปิดรับแทง', status: 'closed', closingTime: '16:00', country: 'id' },
        { id: 'stock-mm', name: 'ไต้หวัน', subName: 'ปิดรับแทง', status: 'closed', closingTime: '14:50', country: 'mm' },
        { id: 'stock-la', name: 'ลาวพัฒนา', subName: 'ปิดรับแทง', status: 'closed', closingTime: '13:30', country: 'la' },
        { id: 'stock-kh', name: 'เกาหลี', subName: 'ปิดรับแทง', status: 'closed', closingTime: '13:30', country: 'kh' },
        { id: 'stock-cn2', name: 'จีน', subName: 'ปิดรับแทง', status: 'closed', closingTime: '13:30', country: 'cn' },
      ]
    },
  ];

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
            <div className="grid grid-cols-3 gap-3">
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
