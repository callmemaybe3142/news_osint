"""Telegram News Viewer - GUI for viewing collected news."""
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
from pathlib import Path
from PIL import Image, ImageTk
import config
from database_reader import SyncDatabaseReader


class NewsViewer:
    """Main GUI application for viewing collected news."""
    
    def __init__(self, root):
        """Initialize the news viewer."""
        self.root = root
        self.root.title(config.WINDOW_TITLE)
        self.root.geometry(f"{config.WINDOW_WIDTH}x{config.WINDOW_HEIGHT}")
        
        # Database
        self.db = SyncDatabaseReader(config.DB_CONFIG)
        try:
            self.db.connect()
        except FileNotFoundError as e:
            messagebox.showerror("Database Error", str(e))
            self.root.quit()
            return
        
        # State
        self.current_page = 0
        self.messages_per_page = config.MESSAGES_PER_PAGE
        self.selected_channel = None
        self.show_duplicates = tk.BooleanVar(value=False)
        self.search_text = tk.StringVar()
        self.current_messages = []
        self.total_messages = 0
        self.current_images = {}
        
        # Setup UI
        self.setup_ui()
        self.load_statistics()
        self.load_channels()
        self.load_messages()
        
    def setup_ui(self):
        """Setup the user interface."""
        # Configure colors
        style = ttk.Style()
        style.theme_use('clam')
        
        # Main container
        main_container = tk.Frame(self.root, bg=config.BG_COLOR)
        main_container.pack(fill=tk.BOTH, expand=True)
        
        # Left panel (filters and stats)
        left_panel = tk.Frame(main_container, bg=config.SECONDARY_BG, width=300)
        left_panel.pack(side=tk.LEFT, fill=tk.Y, padx=5, pady=5)
        left_panel.pack_propagate(False)
        
        # Right panel (messages)
        right_panel = tk.Frame(main_container, bg=config.BG_COLOR)
        right_panel.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # === LEFT PANEL ===
        
        # Statistics
        stats_frame = tk.LabelFrame(
            left_panel, 
            text="Statistics", 
            bg=config.SECONDARY_BG, 
            fg=config.FG_COLOR,
            font=('Arial', 10, 'bold')
        )
        stats_frame.pack(fill=tk.X, padx=5, pady=5)
        
        self.stats_label = tk.Label(
            stats_frame, 
            text="Loading...", 
            bg=config.SECONDARY_BG, 
            fg=config.TEXT_COLOR,
            justify=tk.LEFT,
            font=('Arial', 9)
        )
        self.stats_label.pack(padx=10, pady=10, anchor=tk.W)
        
        # Filters
        filters_frame = tk.LabelFrame(
            left_panel, 
            text="Filters", 
            bg=config.SECONDARY_BG, 
            fg=config.FG_COLOR,
            font=('Arial', 10, 'bold')
        )
        filters_frame.pack(fill=tk.X, padx=5, pady=5)
        
        # Channel filter
        tk.Label(
            filters_frame, 
            text="Channel:", 
            bg=config.SECONDARY_BG, 
            fg=config.TEXT_COLOR
        ).pack(anchor=tk.W, padx=10, pady=(10, 0))
        
        self.channel_combo = ttk.Combobox(filters_frame, state='readonly')
        self.channel_combo.pack(fill=tk.X, padx=10, pady=5)
        self.channel_combo.bind('<<ComboboxSelected>>', self.on_channel_changed)
        
        # Show duplicates checkbox
        tk.Checkbutton(
            filters_frame,
            text="Show duplicates",
            variable=self.show_duplicates,
            command=self.on_filter_changed,
            bg=config.SECONDARY_BG,
            fg=config.TEXT_COLOR,
            selectcolor=config.BG_COLOR,
            activebackground=config.SECONDARY_BG,
            activeforeground=config.FG_COLOR
        ).pack(anchor=tk.W, padx=10, pady=5)
        
        # Search
        tk.Label(
            filters_frame, 
            text="Search:", 
            bg=config.SECONDARY_BG, 
            fg=config.TEXT_COLOR
        ).pack(anchor=tk.W, padx=10, pady=(10, 0))
        
        search_entry = tk.Entry(filters_frame, textvariable=self.search_text)
        search_entry.pack(fill=tk.X, padx=10, pady=5)
        search_entry.bind('<Return>', lambda e: self.on_filter_changed())
        
        tk.Button(
            filters_frame,
            text="Search",
            command=self.on_filter_changed,
            bg=config.ACCENT_COLOR,
            fg=config.FG_COLOR,
            activebackground=config.HIGHLIGHT_COLOR,
            relief=tk.FLAT,
            cursor='hand2'
        ).pack(fill=tk.X, padx=10, pady=(0, 10))
        
        # === RIGHT PANEL ===
        
        # Toolbar
        toolbar = tk.Frame(right_panel, bg=config.SECONDARY_BG)
        toolbar.pack(fill=tk.X, pady=(0, 5))
        
        self.info_label = tk.Label(
            toolbar,
            text="Loading messages...",
            bg=config.SECONDARY_BG,
            fg=config.TEXT_COLOR,
            font=('Arial', 9)
        )
        self.info_label.pack(side=tk.LEFT, padx=10, pady=5)
        
        # Pagination
        pagination_frame = tk.Frame(toolbar, bg=config.SECONDARY_BG)
        pagination_frame.pack(side=tk.RIGHT, padx=10, pady=5)
        
        self.prev_btn = tk.Button(
            pagination_frame,
            text="◀ Previous",
            command=self.previous_page,
            bg=config.ACCENT_COLOR,
            fg=config.FG_COLOR,
            relief=tk.FLAT,
            cursor='hand2'
        )
        self.prev_btn.pack(side=tk.LEFT, padx=2)
        
        self.page_label = tk.Label(
            pagination_frame,
            text="Page 1",
            bg=config.SECONDARY_BG,
            fg=config.TEXT_COLOR,
            font=('Arial', 9)
        )
        self.page_label.pack(side=tk.LEFT, padx=10)
        
        self.next_btn = tk.Button(
            pagination_frame,
            text="Next ▶",
            command=self.next_page,
            bg=config.ACCENT_COLOR,
            fg=config.FG_COLOR,
            relief=tk.FLAT,
            cursor='hand2'
        )
        self.next_btn.pack(side=tk.LEFT, padx=2)
        
        # Messages list with scrollbar
        messages_container = tk.Frame(right_panel, bg=config.BG_COLOR)
        messages_container.pack(fill=tk.BOTH, expand=True)
        
        scrollbar = tk.Scrollbar(messages_container)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.messages_canvas = tk.Canvas(
            messages_container,
            bg=config.BG_COLOR,
            highlightthickness=0,
            yscrollcommand=scrollbar.set
        )
        self.messages_canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.messages_canvas.yview)
        
        self.messages_frame = tk.Frame(self.messages_canvas, bg=config.BG_COLOR)
        self.messages_canvas.create_window((0, 0), window=self.messages_frame, anchor=tk.NW)
        
        # Bind scroll
        self.messages_frame.bind('<Configure>', self.on_frame_configure)
        self.messages_canvas.bind_all('<MouseWheel>', self.on_mousewheel)
        
    def on_frame_configure(self, event=None):
        """Update scroll region when frame size changes."""
        self.messages_canvas.configure(scrollregion=self.messages_canvas.bbox('all'))
        
    def on_mousewheel(self, event):
        """Handle mouse wheel scrolling."""
        self.messages_canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
        
    def load_statistics(self):
        """Load and display statistics."""
        stats = self.db.get_statistics()
        
        stats_text = f"""
Total Messages: {stats['total_messages']:,}
Original: {stats['original_messages']:,}
Duplicates: {stats['duplicate_messages']:,}

Messages with Images: {stats['messages_with_images']:,}
Total Images: {stats['total_images']:,}

Channels: {stats['total_channels']}
        """.strip()
        
        self.stats_label.config(text=stats_text)
        
    def load_channels(self):
        """Load channels into the dropdown."""
        channels = self.db.get_channels()
        
        channel_options = ["All Channels"] + [
            f"{ch['display_name'] or ch['name']} ({ch['message_count']})"
            for ch in channels
        ]
        
        self.channel_combo['values'] = channel_options
        self.channel_combo.current(0)
        self.channels_data = [None] + [ch['telegram_channel_id'] for ch in channels]
        
    def load_messages(self):
        """Load and display messages."""
        # Clear current messages
        for widget in self.messages_frame.winfo_children():
            widget.destroy()
        
        self.current_images.clear()
        
        # Get messages
        channel_idx = self.channel_combo.current()
        channel_id = self.channels_data[channel_idx] if channel_idx >= 0 else None
        
        offset = self.current_page * self.messages_per_page
        
        messages, total = self.db.get_messages(
            channel_id=channel_id,
            show_duplicates=self.show_duplicates.get(),
            search_text=self.search_text.get(),
            offset=offset,
            limit=self.messages_per_page
        )
        
        self.current_messages = messages
        self.total_messages = total
        
        # Update info label
        start = offset + 1
        end = min(offset + len(messages), total)
        self.info_label.config(text=f"Showing {start}-{end} of {total:,} messages")
        
        # Update pagination
        total_pages = (total + self.messages_per_page - 1) // self.messages_per_page
        current_page_num = self.current_page + 1
        self.page_label.config(text=f"Page {current_page_num} of {total_pages}")
        
        self.prev_btn.config(state=tk.NORMAL if self.current_page > 0 else tk.DISABLED)
        self.next_btn.config(state=tk.NORMAL if end < total else tk.DISABLED)
        
        # Display messages
        if not messages:
            tk.Label(
                self.messages_frame,
                text="No messages found",
                bg=config.BG_COLOR,
                fg=config.TEXT_COLOR,
                font=('Arial', 12)
            ).pack(pady=50)
            return
        
        for msg in messages:
            self.create_message_card(msg)
            
        self.messages_canvas.yview_moveto(0)
        
    def create_message_card(self, msg):
        """Create a card for a single message."""
        card = tk.Frame(
            self.messages_frame,
            bg=config.SECONDARY_BG,
            relief=tk.RAISED,
            borderwidth=1
        )
        card.pack(fill=tk.X, padx=5, pady=5)
        
        # Header
        header = tk.Frame(card, bg=config.SECONDARY_BG)
        header.pack(fill=tk.X, padx=10, pady=(10, 5))
        
        
        channel_name = msg['channel_display_name'] or msg['channel_name']
        
        # Handle both datetime objects (PostgreSQL) and strings (SQLite)
        message_datetime = msg['message_datetime']
        if isinstance(message_datetime, str):
            date_str = message_datetime[:19].replace('T', ' ')
        else:
            # It's a datetime object
            date_str = message_datetime.strftime('%Y-%m-%d %H:%M:%S')
        
        tk.Label(
            header,
            text=f"📢 {channel_name}",
            bg=config.SECONDARY_BG,
            fg=config.ACCENT_COLOR,
            font=('Arial', 10, 'bold')
        ).pack(side=tk.LEFT)
        
        tk.Label(
            header,
            text=date_str,
            bg=config.SECONDARY_BG,
            fg=config.TEXT_COLOR,
            font=('Arial', 8)
        ).pack(side=tk.RIGHT)
        
        # Message ID and Group ID indicator
        info_frame = tk.Frame(card, bg=config.SECONDARY_BG)
        info_frame.pack(fill=tk.X, padx=10, pady=(0, 5))
        
        tk.Label(
            info_frame,
            text=f"Message ID: {msg['message_id']}",
            bg=config.SECONDARY_BG,
            fg=config.TEXT_COLOR,
            font=('Arial', 8)
        ).pack(side=tk.LEFT)
        
        # Show grouped_id if this is part of an album
        if msg.get('grouped_id'):
            tk.Label(
                info_frame,
                text=f"📸 Album",
                bg="#4a90e2",
                fg=config.FG_COLOR,
                font=('Arial', 8, 'bold'),
                padx=5,
                pady=2
            ).pack(side=tk.LEFT, padx=10)
            
            tk.Label(
                info_frame,
                text=f"Group ID: {msg['grouped_id']}",
                bg=config.SECONDARY_BG,
                fg=config.TEXT_COLOR,
                font=('Arial', 8, 'italic')
            ).pack(side=tk.LEFT)
        
        # Duplicate indicator
        if msg['is_duplicate']:
            dup_frame = tk.Frame(card, bg=config.SECONDARY_BG)
            dup_frame.pack(fill=tk.X, padx=10, pady=(0, 5))
            
            tk.Label(
                dup_frame,
                text="⚠ DUPLICATE",
                bg=config.DUPLICATE_COLOR,
                fg=config.FG_COLOR,
                font=('Arial', 8, 'bold'),
                padx=5,
                pady=2
            ).pack(side=tk.LEFT)
            
            # Show original message reference
            original = self.db.get_original_message(
                msg['duplicate_of_channel_id'],
                msg['duplicate_of_message_id']
            )
            if original:
                orig_channel = original['channel_display_name'] or original['channel_name']
                orig_date = original['message_datetime'][:10]
                tk.Label(
                    dup_frame,
                    text=f"Original: {orig_channel} ({orig_date})",
                    bg=config.SECONDARY_BG,
                    fg=config.TEXT_COLOR,
                    font=('Arial', 8, 'italic')
                ).pack(side=tk.LEFT, padx=10)
        
        # Message text
        if msg['message_text']:
            text_widget = tk.Text(
                card,
                bg=config.BG_COLOR,
                fg=config.TEXT_COLOR,
                font=('Arial', 10),
                wrap=tk.WORD,
                height=5,
                relief=tk.FLAT,
                padx=10,
                pady=5
            )
            text_widget.pack(fill=tk.BOTH, padx=10, pady=5)
            text_widget.insert('1.0', msg['message_text'])
            text_widget.config(state=tk.DISABLED)
        
        # Images
        if msg['has_media']:
            images = self.db.get_message_images(msg['channel_id'], msg['message_id'])
            if images:
                images_frame = tk.Frame(card, bg=config.SECONDARY_BG)
                images_frame.pack(fill=tk.X, padx=10, pady=(0, 10))
                
                for img_data in images:
                    self.display_image(images_frame, img_data)
                    
    def display_image(self, parent, img_data):
        """Display an image thumbnail."""
        image_path = Path(config.IMAGES_DIR) / img_data['file_path']
        
        if not image_path.exists():
            tk.Label(
                parent,
                text=f"❌ Image not found: {img_data['file_path']}",
                bg=config.SECONDARY_BG,
                fg=config.DUPLICATE_COLOR,
                font=('Arial', 8)
            ).pack(side=tk.LEFT, padx=5)
            return
        
        try:
            # Load and resize image
            img = Image.open(image_path)
            img.thumbnail(
                (config.MAX_IMAGE_DISPLAY_WIDTH, config.MAX_IMAGE_DISPLAY_HEIGHT),
                Image.Resampling.LANCZOS
            )
            
            photo = ImageTk.PhotoImage(img)
            
            # Store reference to prevent garbage collection
            self.current_images[img_data['file_id']] = photo
            
            # Display image
            img_label = tk.Label(parent, image=photo, bg=config.SECONDARY_BG)
            img_label.pack(side=tk.LEFT, padx=5)
            
            # Image info
            size_kb = img_data['compressed_size'] / 1024
            tk.Label(
                parent,
                text=f"{img_data['width']}x{img_data['height']} | {size_kb:.1f} KB",
                bg=config.SECONDARY_BG,
                fg=config.TEXT_COLOR,
                font=('Arial', 8)
            ).pack(side=tk.LEFT, padx=5)
            
        except Exception as e:
            tk.Label(
                parent,
                text=f"❌ Error loading image: {str(e)}",
                bg=config.SECONDARY_BG,
                fg=config.DUPLICATE_COLOR,
                font=('Arial', 8)
            ).pack(side=tk.LEFT, padx=5)
            
    def on_channel_changed(self, event=None):
        """Handle channel selection change."""
        self.current_page = 0
        self.load_messages()
        
    def on_filter_changed(self):
        """Handle filter change."""
        self.current_page = 0
        self.load_messages()
        
    def previous_page(self):
        """Go to previous page."""
        if self.current_page > 0:
            self.current_page -= 1
            self.load_messages()
            
    def next_page(self):
        """Go to next page."""
        total_pages = (self.total_messages + self.messages_per_page - 1) // self.messages_per_page
        if self.current_page < total_pages - 1:
            self.current_page += 1
            self.load_messages()
            
    def on_closing(self):
        """Handle window closing."""
        self.db.close()
        self.root.destroy()


def main():
    """Main entry point."""
    root = tk.Tk()
    app = NewsViewer(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()


if __name__ == "__main__":
    main()
