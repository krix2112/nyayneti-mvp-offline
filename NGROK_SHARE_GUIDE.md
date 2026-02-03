# 🌐 How to Share NyayNeti with Judges (Ngrok Guide)

Since NyayNeti is a powerful **offline** tool, you can't easily put it on Vercel. Instead, we will use **Ngrok**. This creates a "tunnel" from your laptop to the internet. 

Judges will get a real URL (like `https://nyayneti-demo.ngrok-free.app`) that connects directly to the AI running on your laptop.

### Step 1: Install Ngrok
1. Go to [ngrok.com](https://ngrok.com/) and create a free account.
2. Download the Ngrok zip for Windows.
3. Extract `ngrok.exe` to your project folder (`c:\Users\Vansh Bhatia\nayaneti\nyayneti-mvp`).

### Step 2: Connect your Account
Open a terminal in your project folder and run:
```powershell
./ngrok config add-authtoken YOUR_AUTH_TOKEN_FROM_DASHBOARD
```
*(You can find your auth token on the Ngrok dashboard after logging in)*

### Step 3: Start your App
Run your app as usual:
```powershell
python run.py
```
Wait until you see "✅ Browser opened to http://localhost:8000".

### Step 4: Start the Tunnel
Open a **new** terminal window and run:
```powershell
./ngrok http 8000
```

### Step 5: Share the Link!
Ngrok will show a window like this:
```
Forwarding                    https://a1b2-c3d4.ngrok-free.app -> http://localhost:8000
```
- **Copy the `https://...` link.**
- Give this link to the judges!
- **IMPORTANT**: Keep both the `python run.py` terminal and the `ngrok` terminal open during your pitch.

---

### 💡 Why this is better for your pitch:
1. **Performance**: It uses your laptop's RAM to run the AI, so it's much faster than a cheap cloud server.
2. **True Offline Story**: You can tell the judges: "The AI is actually running on my laptop right now; this link is just a window into it."
3. **No Setup for Judges**: They don't need to install anything. They just open the link.
