export const MOCK_DEVICES = [
  {
    _id: 'dev_101',
    name: "Alex's Samsung Galaxy S24 Ultra",
    modelName: 'SM-S928B',
    osVersion: 'Android 14 (One UI 6.1)',
    status: 'online',
    batteryLevel: 88,
    isCharging: true,
    storageUsed: 68.4,
    storageTotal: 256,
    networkType: '5G Mobile Data',
    ipAddress: '192.168.1.140',
    lastSeen: 'Just now'
  },
  {
    _id: 'dev_102',
    name: 'Work iPhone 15 Pro Max',
    modelName: 'iPhone 15 Pro Max',
    osVersion: 'iOS 17.5.1',
    status: 'online',
    batteryLevel: 62,
    isCharging: false,
    storageUsed: 112.0,
    storageTotal: 512,
    networkType: 'WiFi (Office 5GHz)',
    ipAddress: '192.168.1.188',
    lastSeen: '2 mins ago'
  },
  {
    _id: 'dev_103',
    name: 'Personal Pixel 8 Pro',
    modelName: 'Google Pixel 8 Pro',
    osVersion: 'Android 14',
    status: 'offline',
    batteryLevel: 15,
    isCharging: false,
    storageUsed: 45.2,
    storageTotal: 128,
    networkType: 'WiFi (Home)',
    ipAddress: '192.168.1.92',
    lastSeen: '3 hours ago'
  }
];

export const MOCK_MEDIA = [
  {
    _id: 'm1',
    filename: 'IMG_20260803_1102.jpg',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    type: 'photo',
    category: 'Camera',
    size: '4.2 MB',
    date: '2026-08-03 11:02 AM'
  },
  {
    _id: 'm2',
    filename: 'IMG_20260802_1945.jpg',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
    type: 'photo',
    category: 'Camera',
    size: '3.8 MB',
    date: '2026-08-02 07:45 PM'
  },
  {
    _id: 'm3',
    filename: 'Screenshot_20260803_0915.png',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    type: 'photo',
    category: 'Screenshots',
    size: '1.5 MB',
    date: '2026-08-03 09:15 AM'
  },
  {
    _id: 'm4',
    filename: 'VID_20260801_1430.mp4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    type: 'video',
    category: 'Camera',
    size: '28.4 MB',
    date: '2026-08-01 02:30 PM'
  },
  {
    _id: 'm5',
    filename: 'WhatsApp_Img_20260802.jpg',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    type: 'photo',
    category: 'WhatsApp',
    size: '2.1 MB',
    date: '2026-08-02 03:20 PM'
  },
  {
    _id: 'm6',
    filename: 'VID_20260731_1800.mp4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    type: 'video',
    category: 'WhatsApp',
    size: '42.0 MB',
    date: '2026-07-31 06:00 PM'
  }
];

export const MOCK_MESSAGES = [
  {
    contactName: 'Sarah Jenkins',
    phoneNumber: '+1 (555) 234-5678',
    threads: [
      { id: 1, body: 'Hey! Are you still at the office?', direction: 'incoming', time: '10:42 AM' },
      { id: 2, body: 'Yes, just finishing up the mobile sync report.', direction: 'outgoing', time: '10:44 AM' },
      { id: 3, body: 'Awesome, can you check the device photos from yesterday?', direction: 'incoming', time: '10:45 AM' },
      { id: 4, body: 'Already backed up to the dashboard! Check the media tab.', direction: 'outgoing', time: '10:48 AM' }
    ]
  },
  {
    contactName: 'David Miller (Manager)',
    phoneNumber: '+1 (555) 987-6543',
    threads: [
      { id: 10, body: 'Please confirm device IMEI and serial numbers when ready.', direction: 'incoming', time: 'Yesterday' },
      { id: 11, body: 'All 3 devices are enrolled in the Remote Portal.', direction: 'outgoing', time: 'Yesterday' }
    ]
  },
  {
    contactName: 'Bank OTP Alert',
    phoneNumber: 'SMS-6649',
    threads: [
      { id: 20, body: 'Your verification code for Remote Access Login is 849201. Valid for 5 minutes.', direction: 'incoming', time: '09:12 AM' }
    ]
  }
];

export const MOCK_CALL_LOGS = [
  { _id: 'c1', contactName: 'Sarah Jenkins', phoneNumber: '+1 (555) 234-5678', type: 'incoming', duration: '04:15', timestamp: 'Today, 10:30 AM' },
  { _id: 'c2', contactName: 'David Miller', phoneNumber: '+1 (555) 987-6543', type: 'outgoing', duration: '12:40', timestamp: 'Today, 09:15 AM' },
  { _id: 'c3', contactName: 'Unknown Sender', phoneNumber: '+1 (800) 444-1234', type: 'missed', duration: '00:00', timestamp: 'Yesterday, 06:45 PM' },
  { _id: 'c4', contactName: 'Elena Rostova', phoneNumber: '+1 (555) 345-6789', type: 'incoming', duration: '01:22', timestamp: 'Yesterday, 02:10 PM' },
  { _id: 'c5', contactName: 'Tech Support', phoneNumber: '+1 (888) 555-0199', type: 'rejected', duration: '00:00', timestamp: 'Aug 01, 11:00 AM' }
];

export const MOCK_CONTACTS = [
  { _id: 'ct1', name: 'Sarah Jenkins', phone: '+1 (555) 234-5678', email: 'sarah.j@example.com', starred: true, initial: 'S' },
  { _id: 'ct2', name: 'David Miller', phone: '+1 (555) 987-6543', email: 'david.m@company.com', starred: true, initial: 'D' },
  { _id: 'ct3', name: 'Elena Rostova', phone: '+1 (555) 345-6789', email: 'elena.r@design.org', starred: false, initial: 'E' },
  { _id: 'ct4', name: 'Michael Scott', phone: '+1 (555) 777-8899', email: 'mscott@dundermifflin.com', starred: false, initial: 'M' },
  { _id: 'ct5', name: 'Tech Support Line', phone: '+1 (888) 555-0199', email: 'support@cloudsync.io', starred: false, initial: 'T' }
];

export const MOCK_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194,
  address: 'San Francisco, CA, USA (Market St & 4th St)',
  accuracy: 4.8,
  speed: '0 km/h',
  timestamp: 'Just now'
};
