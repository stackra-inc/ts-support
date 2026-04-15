# MNGO POS Platform - Full Implementation Tracker

## Overview

Complete implementation tracker for the MNGO POS platform covering all work from
project inception through current state. Includes initial project setup,
monorepo scaffolding, package creation, application bootstrapping, component
development, and all feature implementations across the platform.

## Tasks

- [ ] 1. Project Setup and Monorepo Scaffolding
  - [ ] 1.1 Initialize pnpm monorepo with pnpm-workspace.yaml (packages/_,
        packages/cart/_, packages/nav/_, apps/_)
  - [ ] 1.2 Configure Turborepo (turbo.json) with build, dev, lint, test,
        typecheck task pipeline
  - [ ] 1.3 Root package.json with scripts (build, dev, dev:local, proxy, lint,
        test, clean, clean:all, upgrade, format)
  - [ ] 1.4 Configure pnpm 10 with allowBuilds for native modules (@swc/core,
        @tailwindcss/oxide, esbuild, sharp, unrs-resolver)
  - [ ] 1.5 Set up Prettier and ESLint configuration across all packages
  - [ ] 1.6 Set up Caddy reverse proxy for local development (scripts/Caddyfile)
  - [ ] 1.7 Set up local domain scripts for \*.mngo.test subdomains
        (setup-local-domains.sh, setup-local-domains.ps1)
  - [ ] 1.8 Configure Vercel deployment (vercel.json, .vercel/project.json)
  - [ ] 1.9 Set up Jira sync script (scripts/jira-sync/sync-to-jira.sh) for
        spec-to-Jira ticket creation

- [ ] 2. Vite Application Bootstrapping
  - [ ] 44.1 Create apps/vite-template with Vite 8, React 19, TypeScript 6, SWC
        compiler
  - [ ] 44.2 Configure Tailwind CSS 4 with @tailwindcss/vite plugin and PostCSS
  - [ ] 44.3 Configure HeroUI v3 (3.0.2) with @heroui/react and @heroui/styles
  - [ ] 44.4 Set up vite-tsconfig-paths for @ path aliases
  - [ ] 44.5 Configure PWA support with vite-plugin-pwa (MNGO POS manifest,
        service worker, offline caching)
  - [ ] 2.6 Set up React Router DOM 7 with BrowserRouter
  - [ ] 2.7 Configure Vite dev server (host 0.0.0.0, port 3000, allowedHosts for
        \*.mngo.test)
  - [ ] 2.8 Set up React deduplication in Vite resolve config (react, react-dom,
        jsx-runtime)
  - [ ] 2.9 Suppress HeroUI v3 beta CSS warnings in esbuild config

- [ ] 3. Dependency Injection and Module System
  - [ ] 45.1 Set up InversifyJS DI container (@abdokouta/ts-container,
        @abdokouta/ts-application, @abdokouta/ts-container-react)
  - [ ] 45.2 Create AppModule (app.module.ts) as root DI module with @Module
        decorator
  - [ ] 45.3 Bootstrap application in main.tsx with
        ApplicationContext.create(AppModule) and ContainerProvider
  - [ ] 45.4 Configure ThemeModule.forRoot with custom midnight theme
  - [ ] 45.5 Configure MultiTenancyModule.forRoot with HEADER mode and
        subdomain/router resolvers
  - [ ] 45.6 Configure SettingsModule.forRoot with localStorage driver and
        feature settings registration
  - [ ] 3.7 Register UI slot entries in AppModule (login.email.before.submit
        terms checkbox, login.footer.after version badge)
  - [ ] 3.8 Register Nav slot entries in AppModule (nav.pos.sidebar.after help
        hint)
  - [ ] 3.9 Configure CartModule.forRoot with POS channel and register cart slot
        entries (loyalty points, promo hint, rewards tier)
  - [ ] 3.10 Register cart keyboard shortcuts (New Order, Undo, Redo, Hold,
        Checkout, Clear, Apply Promo, Link Customer)

- [ ] 4. Provider Stack and Core Wiring
  - [ ] 46.1 Create Provider component (provider.tsx) composing ThemeProvider,
        MultiTenancyProvider, and Refine
  - [ ] 46.2 Configure Refine with @refinedev/simple-rest data provider and
        syncWithLocation
  - [ ] 46.3 Create multi-tenancy provider instance with
        createMultiTenancyProvider
  - [ ] 46.4 Create tenant-aware data provider with createDataProvider wrapping
        base data provider
  - [ ] 46.5 Wrap auth provider with multitenancy support (withMultitenancy) for
        tenant-scoped auth
  - [ ] 46.6 Wire KbdVisibilityProvider from @abdokouta/kbd for keyboard
        shortcut visibility toggle
  - [ ] 46.7 Set up PWA deferred prompt capture (beforeinstallprompt event on
        window)

- [ ] 5. Multi-Tenancy Configuration
  - [ ] 47.1 Define mock tenants (Acme Corporation, Globex Inc, Initech) with
        IDs, slugs, subdomains, logos, settings
  - [ ] 47.2 Configure multitenancy (HEADER mode, subdomain/router resolvers,
        baseDomain mngo.test, fallback tenant_acme)
  - [ ] 47.3 Create subdomain-to-tenant mapping (acme -> tenant_acme, globex ->
        tenant_globex, initech -> tenant_initech)
  - [ ] 47.4 Implement fetchTenants and fetchTenant mock API functions with
        simulated delays
  - [ ] 47.5 Configure cache system with defineConfig (memory, redis, session,
        null stores)

- [ ] 6. POS Context and State Management
  - [ ] 48.1 Create POSProvider context with currency selection (7 currencies:
        AED, USD, EUR, GBP, SAR, INR, CNY with exchange rates)
  - [ ] 48.2 Implement language selection (8 languages: en, ar, fr, zh, hi, ru,
        de, ja)
  - [ ] 48.3 Wire dark mode toggle to next-themes
  - [ ] 48.4 Implement sidebar collapsed state management
  - [ ] 48.5 Implement spotlight (Cmd+K) open state with global keyboard
        shortcut
  - [ ] 48.6 Implement multi-cart session management (create, delete, rename,
        switch, getActiveCart, updateActiveCartItems)
  - [ ] 48.7 Wire keyboard shortcut visibility to @abdokouta/kbd
        KbdVisibilityProvider
  - [ ] 48.8 Create DockProvider context with zone-based actions (catalog, cart,
        drawer, hidden zones)
  - [ ] 48.9 Implement dock action management (setCatalogActions,
        setCartActions, setDrawerActions, hide)

- [ ] 7. Settings System Implementation
  - [ ] 49.1 Create DisplaySettings DTO with decorators (@Setting, @Field,
        @Section): compact, brightness, fontSize, highContrast, reduceMotion,
        sidebarCollapsed
  - [ ] 49.2 Create TerminalSettings DTO: terminalId (with regex validation),
        stationName, receiptFormat, autoPrint, printMode, cashDrawerEnabled,
        scannerMode, idleLockMinutes
  - [ ] 49.3 Create LocaleSettings DTO: language, dateFormat, currency
        preferences
  - [ ] 49.4 Create NetworkSettings DTO: API endpoint, sync preferences, offline
        mode, showNetworkStatus
  - [ ] 49.5 Register all settings DTOs via SettingsModule.forFeature in
        AppModule

- [ ] 8. Routing and Page Structure
  - [ ] 50.1 Set up App.tsx with React Router Routes covering all application
        routes
  - [ ] 50.2 Configure landing routes (/, /features, /pricing, /about, /contact,
        /blog, /careers, /privacy, /terms, /product/:slug, /ai-technology,
        /integrations, /solutions/:slug, /security, /changelog)
  - [ ] 50.3 Configure auth routes with AuthLayoutWrapper (/login,
        /forgot-password, /reset-password, /otp, /verify, /force-password,
        /account-locked, /device-limit, /lock)
  - [ ] 50.4 Configure POS routes with POSProvider + AISidekickProvider +
        POSLayoutV2 (/pos, /pos/v2, /pos/fnb)
  - [ ] 50.5 Configure admin routes with DashboardLayout (/admin, /admin/events,
        /admin/tickets, /admin/categories, /admin/seat-maps, /admin/orders,
        /admin/analytics, /admin/customers, /admin/settings, /admin/memberships)
  - [ ] 50.6 Configure demo routes (/demos, /dashboard, /layout-demo,
        /multitenancy-demo, /theme-demo, /drawer-stack-demo, /onboarding-demo,
        /command-dock-demo, /pwa-demo, /nav-demo, /seat-map-builder,
        /settings-demo)
  - [ ] 50.7 Configure error routes (/error/404, /error/500, /error/401,
        /error/maintenance) with router-based navigation wrappers
  - [ ] 50.8 Set up catch-all 404 route

- [ ] 9. POS Layout Implementation
  - [ ] 51.1 Create POSLayoutV2 with DrawerStackProvider wrapper and NavProvider
        integration
  - [ ] 51.2 Implement live clock hook (useClock) with time and date display
  - [ ] 51.3 Build spotlight command catalog (16 commands across Actions,
        System, Preferences groups)
  - [ ] 51.4 Implement buildPosNavTree helper mapping categories to NavTree with
        DuplicateNodeError handling
  - [ ] 51.5 Wire Nav.POS.Header with slot props (logo, spotlight, shift,
        notifications, ai, user)
  - [ ] 51.6 Implement drawer push functions (openNotifications, openShift,
        openProfile, openMembership) using useDrawerStack
  - [ ] 51.7 Wire spotlight command execution (execCommand) mapping 16 commands
        to actions
  - [ ] 51.8 Implement global keyboard shortcuts (Cmd+L lock, Cmd+N new order,
        Cmd+B sidebar, Cmd+, settings, Cmd+. AI, Cmd+D dark mode, Cmd+T shift,
        Cmd+R refund)
  - [ ] 51.9 Implement idle auto-lock timer with 30s warning countdown and
        configurable timeout
  - [ ] 51.10 Wire AI navigation events (ai-navigate-ui, ai-toggle-dark-mode,
        ai-drawer-navigate-section)
  - [ ] 51.11 Integrate WalkthroughOverlayBridge and HighlightOverlayBridge from
        AISidekick context
  - [ ] 51.12 Integrate SuggestionPopup and AutomationToast overlays
  - [ ] 51.13 Apply display settings effects (brightness CSS filter, compact
        mode data attribute)
  - [ ] 51.14 Wire CmdkSpotlightAdapter bridging cmdk-based Spotlight to
        Nav.POS.Spotlight interface

- [ ] 10. POS Theme and Styling
  - [ ] 52.1 Create globals.css with Tailwind CSS 4, HeroUI styles import, and
        cross-package source scanning
  - [ ] 52.2 Create pos_globals.css with POS-scoped theme variables ([data-pos]
        attribute scoping)
  - [ ] 52.3 Define light mode POS theme (oklch color tokens: accent,
        background, foreground, surface, danger, success, warning, etc.)
  - [ ] 52.4 Define dark mode POS theme with matching oklch tokens
  - [ ] 52.5 Implement cursor pointer rules for all interactive elements
  - [ ] 52.6 Implement custom scrollbar styles (.custom-scrollbar)
  - [ ] 52.7 Implement compact mode CSS overrides ([data-compact="true"]
        responsive spacing)
  - [ ] 52.8 Implement custom range slider styles (.mngo-slider with webkit and
        moz variants)
  - [ ] 52.9 Implement AI glow border animations (ai-glow-spin keyframes,
        .ai-glow-border, .ai-glow-border-rounded with ::before/::after
        pseudo-elements)
  - [ ] 52.10 Create landing-theme.css for marketing pages

- [ ] 11. Type Definitions and Data Models
  - [ ] 39.1 Create pos.types.ts with all POS domain types (VenueEvent,
        TicketType, TimeSlot, EventCategory, Seat, SeatRow, SeatSection,
        SeatMap, CartItem, PaymentSplit, etc.)
  - [ ] 39.2 Define 8 venue types (theatre, cinema, arena, circus, concert-hall,
        conference, opera, stadium)
  - [ ] 39.3 Define 5 admission types (general, seated, multipass, scheduled,
        rental)
  - [ ] 39.4 Define seat map types (SeatMap, VenueFloor, SeatSection, SeatRow,
        Seat, StandingZone, VenueBox, Aisle, VenueElement, VenueStage)
  - [ ] 39.5 Define checkout types (CheckoutConfig, PaymentMethod, PaymentSplit
        with foreign currency and wallet support)
  - [ ] 39.6 Define B2B types (B2BAccount, B2BPendingOrder), promotion types
        (CartRule, PriceRule, CartMessage), and RFID types (RFIDLink, TicketTag)
  - [ ] 39.7 Define table management types (VenueTable, TableFloorPlan,
        TableShape, TableStatus)
  - [ ] 39.8 Create membership.types.ts with tier system
        (bronze/silver/gold/platinum), member profiles, family groups, wallet
        transactions, points transactions
  - [ ] 39.9 Define MemberMedia type with RFID/NFC support, token rotation, and
        balance tracking

- [ ] 12. Mock Data and Configuration Files
  - [ ] 40.1 Create categories.json with event categories (theme parks, cinema,
        concerts, sports, etc.)
  - [ ] 40.2 Create events.json with sample venue events across all admission
        types
  - [ ] 40.3 Create addons.json with event add-ons (food combos, equipment,
        upgrades)
  - [ ] 40.4 Create checkout-config.json with tax rates, service fees, payment
        methods, receipt options
  - [ ] 40.5 Create customers.json with sample customer profiles
  - [ ] 40.6 Create members.json with sample membership profiles across all
        tiers
  - [ ] 40.7 Create seat-maps.json with sample venue seat maps for multiple
        venue types
  - [ ] 40.8 Create pools.json with inventory pool allocations
  - [ ] 40.9 Create promo-codes.json with sample promotional codes
  - [ ] 40.10 Create media.json with RFID/NFC media records
  - [ ] 40.11 Create order-history.json with sample order records
  - [ ] 40.12 Create fnb-menu.json with food and beverage menu items
  - [ ] 40.13 Create ai-action-types.json with 8 configurable AI automation
        actions across trust levels
  - [ ] 40.14 Create landing page data files (pricing.json, products.json,
        solutions.json, integrations.json, ai-technology.json)

- [ ] 13. Auth Provider and Auth Pages
  - [ ] 41.1 Wire auth provider from @abdokouta/react-auth
        (lib/auth-provider.ts)
  - [ ] 41.2 Create AuthLayoutWrapper with configurable variant
        (split/centered/fullscreen/kiosk)
  - [ ] 41.3 Create MngoKioskLayout custom auth variant with animated grid
        background and glassmorphism card
  - [ ] 41.4 Create Login page with email/phone identifier and password
  - [ ] 41.5 Create Forgot Password page with email/SMS recovery
  - [ ] 41.6 Create Reset Password page with token-based reset
  - [ ] 41.7 Create OTP Verification page
  - [ ] 41.8 Create Email/Phone Verify page
  - [ ] 41.9 Create Force Password Change page
  - [ ] 41.10 Create Lock Screen page with PIN/password unlock
  - [ ] 41.11 Create Account Locked page
  - [ ] 41.12 Create Device Limit page

- [ ] 14. Landing Pages and Marketing Site
  - [ ] 42.1 Create LandingLayout with dark theme, LandingNavbar, and
        LandingFooter
  - [ ] 42.2 Create LandingNavbar with sticky header, navigation links, and CTA
        buttons
  - [ ] 42.3 Create LandingFooter with link columns and legal bar
  - [ ] 42.4 Create Landing Home page with Hero, Stats, Features Grid,
        Testimonials, CTA sections
  - [ ] 42.5 Create Features page with detailed feature showcase
  - [ ] 42.6 Create Pricing page with 3-tier cards and FAQ
  - [ ] 42.7 Create About page with story, values, team
  - [ ] 42.8 Create Contact page with form and contact info sidebar
  - [ ] 42.9 Create Blog page with post listing and Blog Post detail page
  - [ ] 42.10 Create Careers page with perks and open positions
  - [ ] 42.11 Create Privacy and Terms legal pages
  - [ ] 42.12 Create Product Feature pages (/product/:slug) for POS, ticketing,
        seat maps, AI, analytics
  - [ ] 42.13 Create AI Technology page and AI Tools page
  - [ ] 42.14 Create Integrations page, Security page, Changelog page
  - [ ] 42.15 Create Solution pages (/solutions/:slug) for cinema, theatre,
        arena, entertainment
  - [ ] 14.16 Create landing page components (Hero, StatsSection, FeaturesGrid,
        Testimonials, CTASection, HowItWorks, PricingCards, PartnerStrip,
        EngineTopology, SolutionVisuals, ContactForm)

- [ ] 15. Drawer Stack System - Core Architecture
  - [ ] 1.1 DrawerStackProvider with useReducer state management
        (push/pop/replace/clear/popTo/bringToTop operations)
  - [ ] 1.2 DrawerContainer renderer with backdrop, z-index stacking, slide
        animations, focus trap, scroll lock, and Escape key handling
  - [ ] 1.3 SubViewNavigator for internal drawer navigation with view stack,
        animated transitions, and back button
  - [ ] 1.4 Type definitions (DrawerConfig, DrawerEntry, StackOperations,
        DrawerStackContextValue, SubViewNavigatorProps)
  - [ ] 1.5 Constants and width presets for all drawer types (Notifications
        380px, Profile 420px, Checkout 480px, Event Detail 560px, Seat Map
        640px)
  - [ ] 1.6 useDrawerStack and useSubView consumer hooks with error boundaries
  - [ ] 1.7 Barrel exports from @abdokouta/react-ui package

- [ ] 16. Drawer Stack Enhancements - Lifecycle and Persistence
  - [ ] 44.1 Lifecycle hooks: onBeforeOpen (async guard), onAfterOpen
        (post-animation), onAfterClose (post-exit)
  - [ ] 44.2 Stack persistence via localStorage with persistKey prop and
        onRestore callback
  - [ ] 44.3 Keyboard navigation between stacked drawers (Ctrl+Tab cycling,
        Ctrl+Shift+Tab reverse, Ctrl+1-9 direct access)
  - [ ] 44.4 ResizeObserver integration for mobile bottom sheets with dynamic
        overflow-y toggling
  - [ ] 44.5 enableKeyboardNavigation prop threading through provider to
        container

- [ ] 17. Drawer Stack Hardening - Robustness Improvements
  - [ ] 45.1 Configurable StackDots counter threshold with
        DRAWER_DEFAULTS.MAX_DOTS
  - [ ] 45.2 Horizontal scroll detection in drag handler (useDrawerDrag and
        MobilePanel)
  - [ ] 45.3 Z-index calculation safeguard with computeZIndex helper and
        MAX_STACK_DEPTH warning
  - [ ] 45.4 Consistent subtitle visibility in compact DrawerHeader (fix pills
        guard logic)
  - [ ] 45.5 Focus trap portal support with portalContainers parameter and
        multi-container focus cycling
  - [ ] 45.6 Explicit async return type for pop() -> Promise<void> with handled
        call sites

- [ ] 18. Drawer Stack Critical Fixes - Bug Fixes
  - [ ] 46.1 pop() returns Promise<boolean> for guard result propagation
  - [ ] 46.2 SubViewNavigator inline style transitions replacing broken CSS
        class animations
  - [ ] 46.3 useFocusTrap focus restoration on unmount with DOM containment
        check
  - [ ] 46.4 useDrawerDrag respects onBeforeClose guard with call-first dismiss
        pattern
  - [ ] 46.5 useDrawerDrag AbortController for transitionend listener cleanup
  - [ ] 46.6 usePreventScroll instance-safe shared state via window singleton
  - [ ] 46.7 DrawerContainer defensive wrapper access with null guard and dev
        warning
  - [ ] 46.8 Escape key handler respects event.defaultPrevented

- [ ] 19. Drawer Composite Improvements - New Components
  - [ ] 47.1 DrawerIdContext and useDrawerId hook for scoped slot support
  - [ ] 47.2 ScopedSlot helper and buildScopedSlotName utility for
        drawer-ID-scoped slots
  - [ ] 47.3 DrawerContent component (renamed from DrawerBody with deprecated
        alias)
  - [ ] 47.4 DrawerLoading component with spinner, skeleton, and overlay
        variants
  - [ ] 47.5 DrawerAlert component with info/success/warning/danger variants and
        dismissible support
  - [ ] 47.6 DrawerFooter enhancements: isLoading, startContent, endContent
        props with three-zone layout
  - [ ] 47.7 DrawerHeader isLoading prop with spinner adjacent to title
  - [ ] 47.8 Slot positions added to DrawerSection and DrawerDivider
  - [ ] 47.9 Updated DRAWER_SLOTS constants with CONTENT, ALERT, SECTION,
        DIVIDER keys

- [ ] 20. Composable Cart Engine - @cart/core Package
  - [ ] 48.1 Package scaffolding: @cart/core, @cart/react, @cart/ui,
        @cart/plugins with tsup, vitest, TypeScript config
  - [ ] 48.2 Core data models and types (Cart, CartItem, CartStatus,
        PricingSnapshot, Customer, Channel, etc.)
  - [ ] 48.3 Channel configuration presets (pos, ecommerce, food, custom) with
        resolveConfig deep-merge
  - [ ] 48.4 Cart state machine with enforced transitions
        (active/held/locked/completed) and typed errors
  - [ ] 48.5 Pricing pipeline with composable steps (subtotal, item discounts,
        cart discounts, tax, service charge, rounding, finalization)
  - [ ] 48.6 Core engine functions: createCart, addItem, updateItem, removeItem,
        applyDiscount, applyCoupon, attachCustomer, calculate
  - [ ] 48.7 Cart serialization/deserialization with schema validation and typed
        errors
  - [ ] 48.8 Plugin system with registry, lifecycle hooks (before/afterAddItem,
        before/afterRemoveItem, before/afterCalculate, before/afterStatusChange)
  - [ ] 48.9 Error classes: InvalidTransitionError, CartLockedError,
        CartCompletedError, CartNotFoundError, DuplicatePluginError, etc.

- [ ] 21. Composable Cart Engine - Multi-Cart and Advanced Features
  - [ ] 49.1 CartManager for multi-cart sessions (createCart, switchCart,
        holdCart, resumeCart, mergeCarts, splitCart, duplicateCart,
        expireStaleCarts)
  - [ ] 49.2 Undo/redo history with bounded stack and configurable max depth
  - [ ] 49.3 Offline action queue with FIFO ordering, retry logic (3 retries),
        dead-letter list, and JSON persistence
  - [ ] 49.4 Split payment validation (allocation sum equals cart total) and
        partial checkout (item partitioning with pricing recalculation)
  - [ ] 49.5 Real-time sync adapter interface with SyncEvent, applySyncDelta,
        and last-writer-wins conflict resolution
  - [ ] 49.6 Customer linking with preferences, membership tier, loyalty points,
        and automatic discount application
  - [ ] 49.7 B2B account support with contract pricing, credit limits, and
        assigned product catalogs
  - [ ] 49.8 Event system for state changes (item:added, item:removed,
        status:changed, customer:changed, pricing:recalculated, etc.)

- [ ] 22. Composable Cart Engine - React and UI Packages
  - [ ] 50.1 @cart/react: CartProvider component initializing engine, history,
        manager, plugins, and pipeline
  - [ ] 50.2 @cart/react: Consumer hooks (useCart, useCartItems, useCartPricing,
        useCartActions, useCartManager)
  - [ ] 50.3 @cart/ui: Compound Cart component namespace (Root, Header, Items,
        Item, Summary, Footer, Modifiers, Messages, Customer, Coupon,
        HoldBanner, Empty, SessionSelector)
  - [ ] 50.4 @cart/ui: CartSlot component for plugin-registered extension points
  - [ ] 50.5 @cart/ui: UI hooks (useCartCoupon, useCartCustomer, useCartDerived,
        useCartMessages)
  - [ ] 50.6 @cart/plugins: Loyalty plugin (points earning and redemption)
  - [ ] 50.7 @cart/plugins: Coupon plugin (code validation and discount
        application)
  - [ ] 50.8 @cart/plugins: Inventory plugin and Kitchen routing plugin

- [ ] 23. AI Sidekick Automation - Core Logic
  - [ ] 51.1 Type definitions: ActionTypeDefinition, TrustLevel,
        TenantActionRegistry, AutomationPreference, Suggestion, ExecutionResult,
        AutomationEvent
  - [ ] 51.2 TenantActionRegistry module with loading, fallback, and trust-level
        grouping
  - [ ] 51.3 AutomationPreferenceStore with localStorage persistence,
        per-cashier per-tenant isolation, and stale preference filtering
  - [ ] 51.4 SuggestionEngine with queue (one-at-a-time presentation), routing
        logic (popup vs auto-execute based on preferences)
  - [ ] 51.5 AutomationExecutor with execute/undo logic and 5-second undo window
  - [ ] 51.6 AutomationEventLog with session-scoped in-memory storage (add,
        getRecent, clear)

- [ ] 24. AI Sidekick Automation - Provider and UI Components
  - [ ] 52.1 AISidekickProvider composing all core modules with useAISidekick
        hook
  - [ ] 52.2 SuggestionPopup component (alertdialog with approve/dismiss, opt-in
        toggle, keyboard support, high-trust warning)
  - [ ] 52.3 AutomationToast component (non-blocking notification with undo
        button, 5-second auto-dismiss)
  - [ ] 52.4 AICapabilitiesPanel component (profile drawer sub-view with
        trust-level groups, toggles, summary count, recent activity)
  - [ ] 52.5 Integration into POS layout: AISidekickProvider nested in
        POSProvider, SuggestionPopup and AutomationToast in layout
  - [ ] 52.6 Sample TenantActionRegistry data in ai-action-types.json

- [ ] 25. AI Gateway Backend - Core Infrastructure
  - [ ] 39.1 Package scaffolding with Hono, Vercel AI SDK, WebSocket, Zod,
        PostgreSQL/pgvector dependencies
  - [ ] 39.2 Shared types and interfaces (AuthContext, TrustLevel, Session,
        ToolDefinition, WSClientMessage, WSServerMessage)
  - [ ] 39.3 Environment config loader with Zod validation (OPENAI_API_KEY,
        DATABASE_URL, WS_PORT, rate limits)
  - [ ] 39.4 Authentication middleware for WebSocket and HTTP (token validation,
        tenant/user extraction)
  - [ ] 39.5 Per-tenant sliding window rate limiter (llm, tool, ws categories)
  - [ ] 39.6 Session manager with 5-minute reconnect window, token-limited
        history trimming, pending approvals

- [ ] 26. AI Gateway Backend - Tool System
  - [ ] 40.1 Tool registry with register, get, getForRole, toAITools,
        validateArgs (Zod schema validation)
  - [ ] 40.2 POS tools: mergeCarts, applyPromoCode, applyMemberDiscount,
        holdCart, resumeCart, processRefund, voidTransaction, assignSeat
  - [ ] 40.3 Customer tools: lookupCustomer, getCustomerHistory,
        getLoyaltyStatus
  - [ ] 40.4 Inventory tools: checkStock, getEventDetails, suggestUpsell
  - [ ] 40.5 Admin tools: createCoupon, createEvent, updatePricing, getAnalytics
  - [ ] 40.6 External intelligence tools: getWeather, getSeasonalTrends,
        getLocalEvents, getHolidayCalendar
  - [ ] 40.7 Knowledge base tools: searchKnowledgeBase, getVenueInfo (wired to
        RAG service)
  - [ ] 40.8 UI tools: navigateUI, startWalkthrough (frontend-executable)

- [ ] 27. AI Gateway Backend - AI Services
  - [ ] 41.1 Trust level gate: low/medium auto-execute, high requires approval
        with 60s timeout
  - [ ] 41.2 LLM service: Vercel AI SDK wrapper with GPT-4o primary, GPT-4o-mini
        fallback, streaming and generation modes
  - [ ] 41.3 RAG service: document ingestion, chunking, embedding (1536-dim),
        pgvector cosine similarity search
  - [ ] 41.4 PostgreSQL schema with pgvector extension (knowledge_chunks,
        audit_log, rate_limits, answer_cache tables)
  - [ ] 41.5 Audit logger: append-only, tenant-scoped, PII-redacted, with
        in-memory buffer for DB outages
  - [ ] 41.6 System prompt builder: role-specific (cashier/admin), tenant-aware,
        with full UI context snapshot

- [ ] 28. AI Gateway Backend - Server and Integration
  - [ ] 42.1 WebSocket server for POS terminal connections (auth handshake,
        message routing, streaming responses, suggestion delivery)
  - [ ] 42.2 Hono HTTP server with admin REST endpoints (POST /api/admin/chat,
        POST /api/knowledge/ingest, GET /api/knowledge/search, GET /api/health)
  - [ ] 42.3 Answer cache service with pgvector similarity search (0.92
        threshold), 30-day TTL, stale refresh
  - [ ] 42.4 Main entry point wiring all services, tool registration, graceful
        shutdown on SIGTERM
  - [ ] 42.5 End-to-end tool execution pipeline: LLM tool call -> trust gate ->
        tool registry -> audit log -> result back to LLM

- [ ] 29. AI Chat Enhanced UI - Backend Extensions
  - [ ] 43.1 WebSocket protocol extensions: tool-call, tool-result,
        cached-response message types
  - [ ] 43.2 Frontend tool execution results injected back into LLM conversation
        history
  - [ ] 43.3 Answer cache integration in WebSocket chat handler (cache hit skips
        LLM, cache miss stores factual responses)
  - [ ] 43.4 Enhanced prompt builder with full UI context (route, openDrawers,
        selectedEvent, terminal, currency, language)
  - [ ] 43.5 Real POS tool handler implementations (applyPromoCode, holdCart,
        resumeCart, processRefund, voidTransaction, lookupCustomer, checkStock)

- [ ] 30. AI Chat Enhanced UI - Frontend Components
  - [ ] 44.1 ChatMessage discriminated union types (UserMessage,
        AssistantMessage, ToolCallMessage, NavigationMessage, SystemMessage)
  - [ ] 44.2 Message store in AISidekickProvider replacing simple chatTokens
        with structured ChatMessage array
  - [ ] 44.3 MarkdownRenderer component (react-markdown with rehype-sanitize,
        remark-gfm, custom code/link overrides)
  - [ ] 44.4 ToolCallCard component (tool name, arguments, status badge,
        expandable result)
  - [ ] 44.5 ApprovalCard component (warning-styled, approve/reject buttons,
        timer indicator)
  - [ ] 44.6 NavigationCard component (navigation target with "Go There"
        re-execute button)
  - [ ] 44.7 WalkthroughOverlay component (SVG mask spotlight, popover with
        steps, Next/Back/Skip/Done buttons)
  - [ ] 44.8 UIContextCollector hook (aggregates POS state, debounced 500ms
        updates to gateway)
  - [ ] 44.9 FrontendToolExecutor (navigateUI -> drawer push/scroll/highlight,
        startWalkthrough -> overlay state)
  - [ ] 44.10 Enhanced AIChatPanel wiring all message types with connection
        status and cached response indicators

- [ ] 31. Composable Navigation - @nav/core Package
  - [ ] 45.1 Package scaffolding: @nav/core, @nav/react, @nav/ui, @nav/plugins,
        @nav/refine with monorepo config
  - [ ] 45.2 Core types: NavContext, NavNode, NavSection, NavTree,
        VisibilityRule, BadgeConfig, CollapseState, KeyboardBindings, NavPlugin
  - [ ] 45.3 Error classes: DuplicateNodeError, NavDeserializationError,
        NavSchemaValidationError
  - [ ] 45.4 Context configuration presets (pos, dashboard, landing, ecommerce,
        admin) with resolveNavConfig
  - [ ] 45.5 Tree construction engine: createNavTree, addSection, addNode,
        removeNode, moveNode (immutable operations)
  - [ ] 45.6 Active state resolution: resolve(tree, path, strategy) with exact,
        prefix, and pattern matching
  - [ ] 45.7 Breadcrumb generation: generateBreadcrumbs(tree, nodeId) with
        ancestor chain
  - [ ] 45.8 Visibility filtering: filterByRole(tree, roles, userContext) with
        cascading rules
  - [ ] 45.9 Collapse state management: createCollapseState, toggleCollapse,
        collapseAll, expandToNode
  - [ ] 45.10 Keyboard navigation: createKeyboardBindings, registerShortcut,
        resolveKeyEvent, typeahead search
  - [ ] 45.11 Plugin system: createPluginRegistry, registerPlugin,
        applyPluginNodes, applyPluginBadges
  - [ ] 45.12 Serialization: serialize/deserialize with custom visibility rule
        handling

- [ ] 32. Composable Navigation - React, UI, and Refine Packages
  - [ ] 46.1 @nav/react: NavProvider with tree initialization, plugin
        registration, role filtering, active resolution
  - [ ] 46.2 @nav/react: Consumer hooks (useNav, useNavActions, useBreadcrumbs,
        useNavSection, useNavBadge)
  - [ ] 46.3 @nav/ui: Generic components (Nav.Sidebar, Nav.Header, Nav.Menu,
        Nav.Item, Nav.Breadcrumbs, Nav.Footer, Nav.UserMenu, Nav.Search)
  - [ ] 46.4 @nav/ui: POS components (Nav.POS.Header, Nav.POS.Sidebar,
        Nav.POS.Spotlight, Nav.POS.UserMenu)
  - [ ] 46.5 @nav/ui: Dashboard components (Nav.Dashboard.Layout,
        Nav.Dashboard.Sidebar, Nav.Dashboard.Breadcrumbs,
        Nav.Dashboard.SettingsNav)
  - [ ] 46.6 @nav/ui: Landing components (Nav.Landing.Header,
        Nav.Landing.MobileDrawer, Nav.Landing.Footer)
  - [ ] 46.7 @nav/plugins: Badge, Search, Analytics, and Spotlight plugin
        factories
  - [ ] 46.8 @nav/refine: Refine NavTree builder, menu sync, breadcrumb adapter,
        RefineNavProvider with auto-population from Refine resources

- [ ] 33. Nav Integration - Slot System and POS Migration
  - [ ] 47.1 Slot injection points added to all @nav/ui components (before/after
        slots for Header, Sidebar, Footer across all contexts)
  - [ ] 47.2 NavigationModule DI module with registerSlot and registerSlots
        methods
  - [ ] 47.3 Demo slot registrations in AppModule (pos.header.after,
        pos.sidebar.after)
  - [ ] 47.4 POS layout migration: NavProvider wiring, buildPosNavTree helper
        from categories
  - [ ] 47.5 POSHeader replaced with Nav.POS.Header preserving all interactions
  - [ ] 47.6 Spotlight replaced with Nav.POS.Spotlight with command mapping
  - [ ] 47.7 POSSidebar replaced with Nav.POS.Sidebar with collapse state from
        useNav
  - [ ] 47.8 Cleanup of removed custom POS navigation files
  - [ ] 47.9 Nav demo page with tabbed layout (Generic, POS, Dashboard, Landing)
        and interactive feature demos

- [ ] 34. POS v2 Checkout - Pre-Checkout Flow
  - [ ] 48.1 Extended type definitions: TicketTag, InventoryPool,
        PoolTransferRecord, RFIDLink, B2BAccount, CartRule, PriceRule,
        CartMessage, WalletPaymentMethod
  - [ ] 48.2 EventDetailDrawer: date/time CTA above seats, seat state
        reflection, collapsible details section
  - [ ] 48.3 DateTimePickerDrawer: update behavior using pop() + update()
        instead of new push
  - [ ] 48.4 ProductGrid: responsive auto-fill layout with CSS grid (minmax
        180px, 1fr)
  - [ ] 48.5 DrawerConfig: showCloseButton prop with conditional X button
        rendering
  - [ ] 48.6 Ticket tag UI: selectable chips in EventDetailDrawer, colored
        badges in cart panel

- [ ] 35. POS v2 Checkout - Payment System
  - [ ] 49.1 Split payment calculator: total + tip = remaining, cash overpayment
        shows change, non-cash capped, confirm when fully paid
  - [ ] 49.2 Foreign currency payment: currency selector, exchange rate
        conversion, dual-currency display on split records
  - [ ] 49.3 Customer wallet payment: visible only when customer linked,
        pre-fill with min(remaining, balance), balance validation
  - [ ] 49.4 Gift voucher payment: serial number input with barcode scanner
        support, async validation, auto-apply min(value, remaining)

- [ ] 36. POS v2 Checkout - Cart Operations
  - [ ] 50.1 SplitCartDrawer: item selection with checkboxes, prevent empty
        source cart, confirm creates new cart with selected items
  - [ ] 50.2 Split cart wired into SmartDock (visible when cart has 2+ items)
  - [ ] 50.3 Promotion engine: evaluate cart rules (buy_x_get_y,
        bundle_discount, threshold_discount) and price rules (quantity, member,
        time, channel discounts)
  - [ ] 50.4 CartMessageList component: promotion, upsell, warning, info
        messages with action buttons and dismiss tracking
  - [ ] 50.5 "Nearly qualified" promotion suggestions (e.g., "Add 1 more for Buy
        3 Get 1 Free")

- [ ] 37. POS v2 Checkout - Post-Payment UX
  - [ ] 51.1 OrderConfirmOverlay refactor: payment splits display, timestamp,
        Print Receipt/Send E-Ticket/New Order buttons, 30s auto-dismiss
  - [ ] 51.2 Print service utility: silent print via hidden iframe, printMode
        setting (silent/preview), fallback to window.print()
  - [ ] 51.3 RFID linking in OrderConfirmOverlay: keyboard emulation listener,
        per-ticket tag association, 15s timeout with retry/skip
  - [ ] 51.4 ExperienceBuilderDrawer: 3-step wizard (category grid -> event list
        -> ticket types with quantity steppers) using SubViewNavigator

- [ ] 38. POS v2 Checkout - B2B and Pool Management
  - [ ] 52.1 B2BAccountDrawer: search by name/ID/reference, display pending
        orders with pre-negotiated prices, load into cart
  - [ ] 52.2 B2B contract limit enforcement: quantity adjustment within min/max,
        credit balance as payment method
  - [ ] 52.3 PoolMeter component: horizontal bar with fill percentage,
        color-coded by pool type, remaining units display
  - [ ] 52.4 PoolPerformanceDrawer: utilization %, sell-through rate, remaining
        capacity, date/event/type filters, 60s auto-refresh
  - [ ] 52.5 PoolTransferDrawer: source/destination pool selectors, quantity
        validation, supervisor authorization, transfer logging

- [ ] 39. Post-Checkout Flow - State Machine
  - [ ] 39.1 usePostCheckoutFlow hook with useReducer state machine (idle ->
        order_confirm -> receipt_print -> rfid_link -> experience_builder ->
        idle)
  - [ ] 39.2 flowReducer handling START, ADVANCE, SKIP, SKIP_ALL, RESET actions
        with step sequence
  - [ ] 39.3 buildReceiptContent utility: HTML receipt with venue name, order
        ID, date/time, line items, total, barcode placeholder
  - [ ] 39.4 OrderConfirmOverlay integration with flow (Continue advances, Skip
        All returns to idle)
  - [ ] 39.5 RFIDLinkPrompt drawer: per-ticket link state, media type selector,
        RFID tag input, duplicate validation
  - [ ] 39.6 Receipt print step: buildReceiptContent ->
        PrintService.printReceipt with status toast
  - [ ] 39.7 Experience Builder step: push ExperienceBuilderDrawer for upsell
        after checkout

- [ ] 40. Post-Checkout Flow - Additional Dock Actions
  - [ ] 40.1 MediaLookupDrawer: search by RFID/ticket/barcode, media status,
        encoding info, usage recap, usage log, Block/Unblock/Add to Cart/Purge
        actions
  - [ ] 40.2 VoidRefundDrawer: order search, item selection for partial/full
        void/refund, refund method selection, supervisor authorization
  - [ ] 40.3 Tickets dock action: opens OrderHistory as drawer
  - [ ] 40.4 Experience dock action: opens ExperienceBuilderDrawer standalone
  - [ ] 40.5 Switch User dock action: quick cashier switch with PIN
        re-authentication
  - [ ] 40.6 End Shift / Final Close dock action: cash reconciliation, Z-report
        printing

- [ ] 41. Supporting Packages - @abdokouta/react-kbd
  - [ ] 41.1 Keyboard shortcut system with hotkey registration and command
        palette
  - [ ] 41.2 POS-specific keyboard shortcuts (barcode scanner, quick actions,
        navigation)
  - [ ] 41.3 Package build and publish configuration (ESM + CJS output)

- [ ] 42. Supporting Packages - @abdokouta/react-multitenancy
  - [ ] 42.1 Tenant context provider with tenant resolution and scoped data
        access
  - [ ] 42.2 Multi-tenant isolation for all data stores (cart, preferences,
        sessions, audit logs)
  - [ ] 42.3 Tenant switch handling with registry and preference reload

- [ ] 43. Supporting Packages - @abdokouta/react-theming
  - [ ] 43.1 Theme provider with dark/light mode support and CSS variable
        injection
  - [ ] 43.2 POS-specific theme tokens and color schemes
  - [ ] 43.3 Theme persistence and system preference detection

- [ ] 44. Supporting Packages - @abdokouta/react-auth
  - [ ] 44.1 Authentication provider with token management and session handling
  - [ ] 44.2 Auth pages: login, OTP, reset password, forgot password, lock
        screen, device limit, account locked
  - [ ] 44.3 Role-based access control integration with navigation and tool
        systems

- [ ] 45. Application Pages and Layouts
  - [ ] 45.1 POS Layout: main terminal interface with header, sidebar, cart
        panel, catalog area, drawer stack
  - [ ] 45.2 POS Home page: event catalog, product grid, category rail, cart
        panel, smart dock
  - [ ] 45.3 FnB Home page: food and beverage catalog with menu categories
  - [ ] 45.4 Landing Layout and pages: home, features, pricing, blog, about,
        contact, careers, integrations, AI technology, security, privacy, terms
  - [ ] 45.5 Dashboard Layout: admin interface with collapsible sidebar and
        breadcrumbs
  - [ ] 45.6 Admin pages: categories, events, memberships, settings, tickets,
        overview
  - [ ] 45.7 Auth Layout and pages: login, OTP, reset-password, forgot-password,
        lock, device-limit, account-locked, verify
  - [ ] 45.8 MNGO Kiosk Layout: self-service kiosk mode
  - [ ] 45.9 Seat Map Builder page with interactive seat/table rendering

- [ ] 46. Application Components - Catalog and Events
  - [ ] 46.1 ProductGrid with responsive auto-fill layout and
        ProductTile/ProductListItem views
  - [ ] 46.2 CategoryRail with horizontal scrolling category navigation
  - [ ] 46.3 CategoryIllustrations for visual category representation
  - [ ] 46.4 EventTile component for event display in catalog
  - [ ] 46.5 Catalog toolbar with view mode toggle, search, and filters

- [ ] 47. Application Components - Cart and Checkout
  - [ ] 47.1 POSCartPanel: cart items list, pricing summary, customer info,
        coupon input, hold banner
  - [ ] 47.2 CartHistoryPanel: previous cart sessions with restore capability
  - [ ] 47.3 MergeCartDrawer: select and merge multiple held carts
  - [ ] 47.4 CheckoutDrawer: payment method grid, split payment calculator, tip
        input, keypad
  - [ ] 47.5 UpsellDrawer: recommended add-ons and upgrades before checkout

- [ ] 48. Application Components - Drawers and Overlays
  - [ ] 48.1 EventDetailDrawer: event info, date/time selection, seat map,
        ticket types, add-ons
  - [ ] 48.2 SeatMapDrawer: interactive seat selection with seat-renderer and
        table-renderer
  - [ ] 48.3 MembershipDrawer: membership plans, benefits, and purchase flow
  - [ ] 48.4 DateTimePickerDrawer: calendar and timeslot selection
  - [ ] 48.5 PromoDrawer: promotional code entry and validation
  - [ ] 48.6 MemberDetailDrawer: member profile, history, and loyalty status
  - [ ] 48.7 WalletTopupDrawer: customer wallet balance top-up
  - [ ] 48.8 TableManagementDrawer: restaurant table assignment and management
  - [ ] 48.9 ActionConfirmDrawer: generic confirmation dialog for destructive
        actions
  - [ ] 48.10 SwitchUserDrawer: quick cashier switch with PIN authentication
  - [ ] 48.11 EndShiftDrawer: shift close-out with cash reconciliation

- [ ] 49. Application Components - Overlays and Panels
  - [ ] 49.1 AI Chat panel: full chat interface with markdown, tool cards,
        approvals, walkthroughs
  - [ ] 49.2 Notification panel: real-time notifications with read/unread state
  - [ ] 49.3 Profile drawer: user settings, AI capabilities, theme preferences
  - [ ] 49.4 Shift panel: shift management with clock-in/out, break tracking
  - [ ] 49.5 Spotlight: command palette with keyboard-driven search and
        execution
  - [ ] 49.6 POS Command Dock and Smart Dock: contextual action buttons for
        catalog and cart operations

- [ ] 50. Application Components - Shared Utilities
  - [ ] 50.1 EmptyState and EmptyStates components for zero-data views
  - [ ] 50.2 LoadingSkeletons for consistent loading states across the app
  - [ ] 50.3 NetworkBanner for offline/online status indication
  - [ ] 50.4 StatCard for dashboard metric display
  - [ ] 50.5 EmployeeQR for staff identification
  - [ ] 50.6 TwoFactorSetup for 2FA enrollment
  - [ ] 50.7 OrderHistory for transaction history display
  - [ ] 50.8 RangeSlider for numeric range selection
  - [ ] 50.9 PosKbd for POS-specific keyboard shortcut display
  - [ ] 50.10 SharedUI utility components (formatters, helpers)

- [ ] 51. Data and Configuration
  - [ ] 51.1 Mock data files: categories, events, products, customers, members,
        addons, checkout-config, seat-maps, pools, promo-codes, media,
        order-history, fnb-menu
  - [ ] 51.2 Landing page data: pricing, products, solutions, integrations, AI
        technology
  - [ ] 51.3 AI action types configuration for tenant action registry
  - [ ] 51.4 Multitenancy configuration with cache settings
  - [ ] 51.5 Terminal settings: display, locale, network, terminal preferences
  - [ ] 51.6 Cart validation utilities and promotion engine rules

- [ ] 52. Infrastructure and DevOps
  - [ ] 52.1 Monorepo setup: pnpm workspaces, turbo build pipeline, shared
        TypeScript config
  - [ ] 52.2 Vercel deployment configuration
  - [ ] 52.3 ESLint and Prettier configuration across all packages
  - [ ] 52.4 Vitest test infrastructure with fast-check for property-based
        testing
  - [ ] 52.5 tsup build configuration for all packages (ESM + CJS dual output)
  - [ ] 52.6 Package publishing configuration with proper peer dependencies and
        exports fields
