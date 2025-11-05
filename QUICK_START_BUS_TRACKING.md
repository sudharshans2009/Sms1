# 🚀 QUICK START GUIDE - Bus Tracking System

## ⚡ Getting Started in 3 Steps

### Step 1: Access the Application
Open in your browser: **http://localhost:3001** (or 3000 if available)

### Step 2: Login
**Admin Access:**
- Email: `admin@123`
- Password: `admin`

### Step 3: View Bus Tracking
1. Click **"Bus Tracking"** in the left sidebar
2. See all 4 buses on the interactive map
3. Click any bus card or map marker to see details
4. Use **"Refresh Locations"** button for manual updates

---

## 🎮 Test GPS Tracking (Fun!)

### Option 1: Use GPS Simulator
1. Open `gps-simulator.html` in your browser (just double-click the file)
2. Select a bus (AV01, AV02, P1, or P2)
3. Click **"Start Auto Update"** button
4. Switch back to the main app
5. Watch the bus move in real-time on the map! 🚌

### Option 2: Manual Testing via Browser
1. In the bus tracking page, note a bus location
2. Open browser console (F12)
3. Run this command:
```javascript
fetch('http://localhost:3001/api/buses', {
  method: 'PUT',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    id: 'AV01',
    currentLocation: {lat: 10.9100, lng: 76.9100},
    speed: 50,
    status: 'Active'
  })
}).then(r => r.json()).then(console.log)
```
4. Refresh the page to see the bus at its new location

### Option 3: Use cURL
```bash
curl -X PUT http://localhost:3001/api/buses \
  -H "Content-Type: application/json" \
  -d '{"id":"AV01","currentLocation":{"lat":10.9100,"lng":76.9100},"speed":45,"status":"Active"}'
```

---

## 🗺️ Map Features

### Interactive Controls
- **Zoom:** Use mouse wheel or +/- buttons
- **Pan:** Click and drag the map
- **Click Marker:** See bus popup with details
- **Click Bus Card:** Focus on specific bus

### What You'll See
- 🚌 **Bus Markers:** Animated icons with pulsing circles
- 🟢 **Active Buses:** Green status indicator
- 🔴 **Inactive Buses:** Red status indicator
- 📍 **GPS Coordinates:** Displayed for each bus
- ⚡ **Speed:** Real-time speed in km/h
- 👥 **Students:** Number of students on board

---

## 🎯 What to Test

### 1. View All Buses ✅
- All 4 buses (AV01, AV02, P1, P2) should appear on map
- Each bus should have a different location

### 2. Select a Bus ✅
- Click any bus card at the top
- Bus details should appear on the right panel
- Map should show the selected bus

### 3. Real-Time Updates ✅
- Location updates automatically every 30 seconds
- Or click "Refresh Locations" for manual update
- Active buses will show movement

### 4. Bus Details ✅
- Driver name
- Route information
- Student count
- Current speed
- GPS coordinates
- Status (Active/Inactive)

### 5. Admin Actions ✅
- "Send Message to Driver" button (admin only)
- "Call Driver" button (admin only)

---

## 📱 GPS Simulator Controls

### Single Update
1. Set latitude and longitude
2. Set speed and status
3. Click "Send Single Update"
4. See success message

### Auto Update Mode
1. Click "Start Auto Update"
2. Bus will move randomly every 5 seconds
3. Click "Stop Auto Update" when done

### Quick Locations
- **Amrita Campus:** 10.9027, 76.9015
- **Coimbatore City:** 11.0168, 76.9558
- **Palakkad City:** 10.7827, 76.6515
- **Random Move:** Generates random nearby location

### Use Your Location
- Click "Use My Current Location"
- Browser will ask for permission
- Your GPS coordinates will be used

---

## 🔧 Troubleshooting

### Map Not Loading?
- Check browser console (F12) for errors
- Ensure internet connection (map tiles need to download)
- Try refreshing the page
- Clear browser cache if needed

### Bus Not Moving?
- Check if bus status is "Active"
- Verify the API endpoint in GPS simulator
- Check browser network tab for API calls
- Ensure port is correct (3001 or 3000)

### GPS Simulator Not Working?
- Check API URL: `http://localhost:3001/api/buses` (or 3000)
- Open browser console to see error messages
- Ensure main app is running
- Check CORS settings (should work on localhost)

---

## 🎨 Other Features to Explore

### Dashboard
- View statistics and quick stats
- See recent announcements
- Check active buses count

### Students Module
- Search by name or ID
- Filter by class (LKG to 12)
- Filter by section (A, B, C, D)
- Clear all filters

### Reports Module
- Generate performance reports
- View attendance summaries
- Export to PDF, Excel, or CSV
- Filter by date range and class

### Announcements Module
- Create new announcements
- Set priority (Normal, Important, Urgent)
- Target specific audiences
- Edit or delete announcements

---

## 📊 API Endpoints

### Get All Buses
```
GET http://localhost:3001/api/buses
```

### Get Specific Bus
```
GET http://localhost:3001/api/buses?id=AV01
```

### Update Bus Location
```
PUT http://localhost:3001/api/buses
Body: {
  "id": "AV01",
  "currentLocation": {"lat": 10.9027, "lng": 76.9015},
  "speed": 45,
  "status": "Active"
}
```

### Add New Bus
```
POST http://localhost:3001/api/buses
Body: {
  "id": "AV05",
  "driverName": "New Driver",
  "route": "New Route",
  "students": 30
}
```

### Delete Bus
```
DELETE http://localhost:3001/api/buses?id=AV05
```

---

## 🎓 Learning Resources

### Technologies Used
- **Next.js:** https://nextjs.org/docs
- **React Leaflet:** https://react-leaflet.js.org/
- **OpenStreetMap:** https://www.openstreetmap.org/
- **Tailwind CSS:** https://tailwindcss.com/

### Map Customization
- Change map style by modifying TileLayer URL
- Add route polylines (future enhancement)
- Add stop markers (future enhancement)
- Customize bus icon appearance

---

## 🚀 Next Steps

### Immediate
1. ✅ Test bus tracking with GPS simulator
2. ✅ View all features in dashboard
3. ✅ Test student filtering
4. ✅ Generate sample reports

### Future Enhancements
1. Connect real GPS devices
2. Add route polylines on map
3. Implement stop markers with ETAs
4. Create parent mobile app
5. Add push notifications
6. Set up geofencing alerts

---

## 📞 Need Help?

### Check Documentation
- `ALL_COMPLETE_FINAL.md` - Complete feature list
- `BUS_TRACKING_COMPLETE.md` - Detailed bus tracking guide
- `.env.example` - Environment setup
- API files have inline documentation

### Common Issues Solved
✅ All compilation errors fixed
✅ Maps loading properly
✅ API endpoints working
✅ Real-time updates functioning
✅ All features tested and working

---

## 🎉 You're Ready!

**Everything is set up and working perfectly!**

**Start testing:**
1. ✅ Bus Tracking with real maps
2. ✅ GPS Simulator for testing
3. ✅ All 12 modules functional
4. ✅ Beautiful Amrita Orange design
5. ✅ Mobile responsive
6. ✅ Zero errors

**Have fun exploring your school management system! 🎊**

---

**Current Status: FULLY FUNCTIONAL ✨**
**Port: 3001 (or 3000)**
**Login: admin@123 / admin**
