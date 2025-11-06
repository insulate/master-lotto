import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react';

// Mock data - will be replaced with actual API calls
const stats = [
  {
    id: 1,
    title: 'ยอดขายวันนี้',
    value: '245,000',
    unit: 'บาท',
    change: '+12.5%',
    icon: DollarSign,
    bgColor: 'bg-accent-success/10',
    iconColor: 'text-accent-success',
    borderColor: 'border-accent-success/30',
  },
  {
    id: 2,
    title: 'จำนวนเอเย่นต์',
    value: '45',
    unit: 'คน',
    change: '+3',
    icon: Users,
    bgColor: 'bg-accent-blue/10',
    iconColor: 'text-accent-blue',
    borderColor: 'border-accent-blue/30',
  },
  {
    id: 3,
    title: 'สมาชิกทั้งหมด',
    value: '1,248',
    unit: 'คน',
    change: '+28',
    icon: Activity,
    bgColor: 'bg-accent-purple/10',
    iconColor: 'text-accent-purple',
    borderColor: 'border-accent-purple/30',
  },
  {
    id: 4,
    title: 'กำไรสุทธิ',
    value: '48,500',
    unit: 'บาท',
    change: '+8.3%',
    icon: TrendingUp,
    bgColor: 'bg-primary-gold/10',
    iconColor: 'text-primary-gold',
    borderColor: 'border-primary-gold/30',
  },
];

const recentActivities = [
  {
    id: 1,
    user: 'เอเย่นต์ A',
    action: 'ฝากเครดิต',
    amount: '+50,000 บาท',
    time: '5 นาทีที่แล้ว',
    type: 'deposit',
  },
  {
    id: 2,
    user: 'สมาชิก B',
    action: 'แทงหวย',
    amount: '-2,500 บาท',
    time: '12 นาทีที่แล้ว',
    type: 'bet',
  },
  {
    id: 3,
    user: 'เอเย่นต์ C',
    action: 'ถอนเครดิต',
    amount: '-30,000 บาท',
    time: '25 นาทีที่แล้ว',
    type: 'withdraw',
  },
  {
    id: 4,
    user: 'สมาชิก D',
    action: 'ชนะรางวัล',
    amount: '+15,000 บาท',
    time: '1 ชั่วโมงที่แล้ว',
    type: 'win',
  },
  {
    id: 5,
    user: 'เอเย่นต์ E',
    action: 'ฝากเครดิต',
    amount: '+75,000 บาท',
    time: '2 ชั่วโมงที่แล้ว',
    type: 'deposit',
  },
];

export default function MasterDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-light-gold">
            Dashboard
          </h1>
          <p className="text-text-muted mt-1">
            ภาพรวมระบบหวยออนไลน์
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-text-muted">วันนี้</p>
          <p className="text-lg font-semibold text-text-primary">
            {new Date().toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className={`bg-bg-card rounded-xl p-6 border ${stat.borderColor} shadow-md hover:shadow-gold transition-all duration-200`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-text-muted mb-1">{stat.title}</p>
                  <div className="flex items-baseline gap-1">
                    <h3 className="text-2xl font-bold text-text-primary">
                      {stat.value}
                    </h3>
                    <span className="text-sm text-text-muted">{stat.unit}</span>
                  </div>
                  <p className="text-xs text-accent-success mt-2 font-medium">
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.bgColor} ${stat.iconColor} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-bg-card rounded-xl p-6 shadow-md border border-border-default">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">
              กิจกรรมล่าสุด
            </h2>
            <button className="text-sm text-primary-gold hover:text-primary-dark-gold transition-colors">
              ดูทั้งหมด
            </button>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-cream transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'deposit' ? 'bg-accent-success/10 text-accent-success' :
                    activity.type === 'withdraw' ? 'bg-accent-error/10 text-accent-error' :
                    activity.type === 'win' ? 'bg-primary-gold/10 text-primary-gold' :
                    'bg-accent-info/10 text-accent-info'
                  }`}>
                    {activity.type === 'deposit' && '↓'}
                    {activity.type === 'withdraw' && '↑'}
                    {activity.type === 'win' && '★'}
                    {activity.type === 'bet' && '🎲'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {activity.user} - {activity.action}
                    </p>
                    <p className="text-xs text-text-muted">{activity.time}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${
                  activity.amount.startsWith('+') ? 'text-accent-success' : 'text-accent-error'
                }`}>
                  {activity.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-bg-card rounded-xl p-6 shadow-md border border-border-default">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            เมนูด่วน
          </h2>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-4 rounded-lg bg-primary-gold/10 hover:bg-primary-gold/20 text-primary-dark transition-all duration-200 border border-primary-gold/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">เปิดงวดใหม่</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 rounded-lg bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue transition-all duration-200 border border-accent-blue/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="font-medium">เพิ่มเอเย่นต์</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 rounded-lg bg-accent-purple/10 hover:bg-accent-purple/20 text-accent-purple transition-all duration-200 border border-accent-purple/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">ดูรายงาน</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 rounded-lg bg-accent-success/10 hover:bg-accent-success/20 text-accent-success transition-all duration-200 border border-accent-success/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">ตั้งค่าระบบ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
