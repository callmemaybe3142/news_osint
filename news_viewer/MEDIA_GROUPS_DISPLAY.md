# News Viewer - Media Groups Display

## 🎨 Updated GUI Features

The news viewer now properly displays media groups (albums) with visual indicators!

### What You'll See

**For each message card, you'll now see:**

1. **Message ID** - The unique Telegram message ID
2. **Album Badge** - Blue "📸 Album" badge for messages that are part of a media group
3. **Group ID** - The shared `grouped_id` that links photos in the same album

### Visual Example

```
┌─────────────────────────────────────────────────────────────┐
│ 📢 DGF21News                         2025-12-15 07:03      │
│ Message ID: 116490  📸 Album  Group ID: 6197332986169...   │
│                                                             │
│ ကောင်းမွန်သော သတင်းတစ်ပုဒ်နေ (သီဟတွဋ်) သဘိုင်တွင်...  │
│                                                             │
│ [Photo: 904x1280 | 155.6 KB]                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📢 DGF21News                         2025-12-15 07:03      │
│ Message ID: 116491  📸 Album  Group ID: 6197332986169...   │
│                                                             │
│ [Photo: 638x905 | 125.6 KB]                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📢 DGF21News                         2025-12-15 07:03      │
│ Message ID: 116492  📸 Album  Group ID: 6197332986169...   │
│                                                             │
│ [Photo: 640x905 | 128.3 KB]                                │
└─────────────────────────────────────────────────────────────┘
```

**Notice:**
- All three messages have the **same Group ID** (6197332986169068370)
- All three have the **📸 Album** badge
- Each has a **different Message ID** (116490, 116491, 116492)
- Only the first message has the caption text
- Each message shows its own photo

## 🎯 How to Identify Albums

### Single Photo Messages:
```
Message ID: 116500
(No album badge - this is a standalone photo)
```

### Album Messages:
```
Message ID: 116490  📸 Album  Group ID: 6197332986169068370
Message ID: 116491  📸 Album  Group ID: 6197332986169068370
Message ID: 116492  📸 Album  Group ID: 6197332986169068370
```

**All messages with the same Group ID are part of the same album!**

## 📊 Visual Indicators

### Color Coding:
- **Blue Badge** (#4a90e2) - "📸 Album" indicates media group
- **Message ID** - Gray text showing unique message identifier
- **Group ID** - Italic gray text showing the shared album identifier

### Badge Meanings:
- **📸 Album** - This message is part of a multi-photo album
- **⚠ DUPLICATE** - This message text is a duplicate (red badge)

## 🔍 Finding Albums in the Viewer

### Method 1: Visual Scanning
- Look for the blue "📸 Album" badge
- Messages with the same Group ID are in the same album

### Method 2: Group ID Matching
- Copy a Group ID
- Search through messages to find all with the same Group ID

### Method 3: Database Query
```sql
-- Find all messages in a specific album
SELECT message_id, message_text, grouped_id
FROM messages
WHERE grouped_id = 6197332986169068370
ORDER BY message_id;
```

## 🎨 UI Layout

Each message card now shows:

```
┌─────────────────────────────────────────────────────┐
│ Header Row:                                         │
│   📢 Channel Name (blue)    Timestamp (gray, right) │
│                                                     │
│ Info Row:                                           │
│   Message ID: 12345 (gray)                         │
│   📸 Album (blue badge) - if in album              │
│   Group ID: 6197... (italic gray) - if in album   │
│                                                     │
│ Duplicate Row (if applicable):                     │
│   ⚠ DUPLICATE (red badge)                          │
│   Original: Channel (date)                         │
│                                                     │
│ Message Text:                                       │
│   [Scrollable text area with message content]      │
│                                                     │
│ Images:                                             │
│   [Photo thumbnail] 1280x720 | 45 KB               │
└─────────────────────────────────────────────────────┘
```

## 🧪 Testing the Viewer

1. **Run the collector** to get messages with albums:
   ```bash
   cd news_collection
   python collector.py
   ```

2. **Launch the viewer**:
   ```bash
   cd news_viewer
   python viewer.py
   ```

3. **Look for album indicators**:
   - Find messages with the "📸 Album" badge
   - Check that messages with the same Group ID appear together
   - Verify each message has its own Message ID

## 📝 What Changed

### Files Updated:
1. **viewer.py** - Added Message ID and Group ID display
2. **database_reader.py** - Added `grouped_id` to queries

### New Features:
- ✅ Message ID displayed for every message
- ✅ "📸 Album" badge for media group messages
- ✅ Group ID displayed for album messages
- ✅ Visual indicator to identify related photos

## 💡 Tips

1. **Identify Albums**: Look for multiple consecutive messages with the same Group ID
2. **First Message**: Usually has the caption text
3. **Subsequent Messages**: Usually have empty text (just photos)
4. **Message Count**: Count messages with same Group ID to know album size

## 🎉 Benefits

- ✅ **Easy to identify albums** - Blue badge stands out
- ✅ **Track related photos** - Same Group ID links them
- ✅ **Verify collection** - See each photo has its own Message ID
- ✅ **Debug issues** - Message IDs help track specific messages

## 🚀 Next Steps

1. **Test the viewer** with your collected data
2. **Verify albums** are displayed correctly
3. **Check Group IDs** match across related messages
4. **Confirm** each photo appears with its own Message ID

The viewer is now ready to properly display media groups! 🎨
