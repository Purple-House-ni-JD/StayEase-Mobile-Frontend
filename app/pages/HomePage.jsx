import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48 - 12) / 2; // 2-column grid with padding + gap

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  tertiary: "#E6BE7E",
  neutral: "#FFFFFF",
  background: "#F5F3EF",
  inputBg: "#FFFFFF",
  inputBorder: "#E0DDD8",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  textLabel: "#5A5550",
  navBg: "#0A1D37",
  heartBg: "rgba(255,255,255,0.92)",
  tagBg: "rgba(10,29,55,0.72)",
  featuredBadge: "#C5A059",
};

const FONTS = {
  headline: "NotoSerif-Bold",
  headlineReg: "NotoSerif-Regular",
  headlineLight: "NotoSerif-Light",
  body: "PlusJakartaSans-Regular",
  bodyLight: "PlusJakartaSans-Light",
  label: "PlusJakartaSans-Bold",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const ROOM_CATEGORIES = ["STANDARD", "DELUXE", "SUITE", "VILLA", "PENTHOUSE"];

const FEATURED_PROPERTY = {
  id: "f1",
  name: "Grand Ocean Villa",
  location: "Malibu, California",
  price: 850,
  badge: "FEATURED",
  image: require("../../assets/images/grand-ocean-villa.png"),
};

const AVAILABLE_ROOMS = [
  {
    id: "r1",
    category: "STANDARD",
    name: "Classic Studio",
    price: 120,
    rating: 4.8,
    image: require("../../assets/images/classic-studio.png"),
  },
  {
    id: "r2",
    category: "DELUXE",
    name: "Azure Horizon",
    price: 245,
    rating: 4.9,
    image: require("../../assets/images/azure-horizon.png"),
  },
  {
    id: "r3",
    category: "SUITE",
    name: "Royal Chambers",
    price: 410,
    rating: 4.7,
    image: require("../../assets/images/royal-chambers.png"),
  },
  {
    id: "r4",
    category: "STANDARD",
    name: "Urban Retreat",
    price: 155,
    rating: 4.6,
    image: require("../../assets/images/urban-retreat.png"),
  },
];

// ─── Heart / Wishlist Button ──────────────────────────────────────────────────
const HeartButton = () => {
  const [liked, setLiked] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    setLiked((prev) => !prev);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.35,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <TouchableOpacity
      style={styles.heartBtn}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Animated.Text
        style={[styles.heartIcon, { transform: [{ scale: scaleAnim }] }]}
      >
        {liked ? "♥" : "♡"}
      </Animated.Text>
    </TouchableOpacity>
  );
};

// ─── Category Tab ─────────────────────────────────────────────────────────────
const CategoryTab = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={styles.tabWrapper}
  >
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
      {label}
    </Text>
    {active && <View style={styles.tabUnderline} />}
  </TouchableOpacity>
);

// ─── Featured Card ────────────────────────────────────────────────────────────
const FeaturedCard = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.featuredCard}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <ImageBackground
      source={item.image}
      style={styles.featuredImage}
      imageStyle={{ borderRadius: 16 }}
      resizeMode="cover"
    >
      <View style={styles.featuredOverlay}>
        {/* Badge */}
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>{item.badge}</Text>
        </View>

        {/* Bottom info */}
        <View style={styles.featuredBottom}>
          <View>
            <Text style={styles.featuredName}>{item.name}</Text>
            <Text style={styles.featuredLocation}>{item.location}</Text>
          </View>
          <View style={styles.featuredPriceBox}>
            <Text style={styles.featuredPrice}>${item.price}</Text>
            <Text style={styles.featuredPriceSub}>per night</Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  </TouchableOpacity>
);

// ─── Room Card (2-column grid) ────────────────────────────────────────────────
const RoomCard = ({ item, onPress }) => (
  <TouchableOpacity
    style={[styles.roomCard, { width: CARD_WIDTH }]}
    onPress={onPress}
    activeOpacity={0.88}
  >
    <ImageBackground
      source={item.image}
      style={styles.roomImage}
      imageStyle={{ borderTopLeftRadius: 14, borderTopRightRadius: 14 }}
      resizeMode="cover"
    >
      <View style={styles.roomImage}>
        <HeartButton />
      </View>
    </ImageBackground>

    {/* Info */}
    <View style={styles.roomInfo}>
      <Text style={styles.roomCategory}>{item.category}</Text>
      <Text style={styles.roomName}>{item.name}</Text>
      <View style={styles.roomPriceRow}>
        <Text style={styles.roomPrice}>${item.price}</Text>
        <Text style={styles.roomRating}>★ {item.rating}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("STANDARD");
  const [checkInOut, setCheckInOut] = useState("Oct 12 - 15");
  const [guests, setGuests] = useState(2);

  // Animations
  const headerFade = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(contentSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const filteredRooms = AVAILABLE_ROOMS.filter(
    (r) => r.category === activeCategory || activeCategory === "ALL",
  );
  // Show all rooms if none match the active category
  const displayedRooms =
    filteredRooms.length > 0 ? filteredRooms : AVAILABLE_ROOMS;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* ── Top Navigation Bar ── */}
      <Animated.View style={[styles.navbar, { opacity: headerFade }]}>
        <SafeAreaView edges={["top"]} style={styles.navSafe}>
          <View style={styles.navInner}>
            {/* Hamburger */}
            <TouchableOpacity style={styles.navHamburger} activeOpacity={0.7}>
              <View style={styles.hamLine} />
              <View style={[styles.hamLine, { width: 18 }]} />
              <View style={styles.hamLine} />
            </TouchableOpacity>

            {/* Brand */}
            <Text style={styles.navBrand}>StayEase</Text>

            {/* Right icons */}
            <View style={styles.navRight}>
              <TouchableOpacity style={styles.navIconBtn} activeOpacity={0.7}>
                <Text style={styles.navIcon}>🔔</Text>
              </TouchableOpacity>
              {/* ── Avatar placeholder – replace with <Image source={...} /> ── */}
              {/* <Image source={require("../../assets/images/avatar.jpg")} style={styles.avatar} /> */}
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>J</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={{
            opacity: contentFade,
            transform: [{ translateY: contentSlide }],
          }}
        >
          {/* ── Greeting ── */}
          <View style={styles.greetingSection}>
            <Text style={styles.greetingText}>Good morning, Julian</Text>
            <Text style={styles.greetingSubtext}>
              Find your perfect stay today.
            </Text>
          </View>

          {/* ── Search Bar ── */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search destinations..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* ── Filter Chips ── */}
          <View style={styles.filterRow}>
            {/* Date chip */}
            <TouchableOpacity
              style={styles.filterChipActive}
              activeOpacity={0.8}
            >
              <Text style={styles.filterChipIcon}>📅</Text>
              <Text style={styles.filterChipTextActive}>{checkInOut}</Text>
            </TouchableOpacity>

            {/* Guests chip */}
            <TouchableOpacity style={styles.filterChip} activeOpacity={0.8}>
              <Text style={styles.filterChipIcon}>👤</Text>
              <Text style={styles.filterChipText}>{guests} Guests</Text>
            </TouchableOpacity>
          </View>

          {/* ── Category Tabs ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScroll}
            contentContainerStyle={styles.tabsContent}
          >
            {ROOM_CATEGORIES.map((cat) => (
              <CategoryTab
                key={cat}
                label={cat}
                active={activeCategory === cat}
                onPress={() => setActiveCategory(cat)}
              />
            ))}
          </ScrollView>

          {/* ── Featured Property ── */}
          <FeaturedCard
            item={FEATURED_PROPERTY}
            onPress={() => {
              // TODO: router.push(`/pages/PropertyDetailPage?id=${FEATURED_PROPERTY.id}`);
            }}
          />

          {/* ── Available Rooms Header ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Rooms</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.sectionViewAll}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          {/* ── Room Grid ── */}
          <View style={styles.roomGrid}>
            {AVAILABLE_ROOMS.map((room) => (
              <RoomCard
                key={room.id}
                item={room}
                onPress={() => {
                  // TODO: router.push(`/pages/RoomDetailPage?id=${room.id}`);
                }}
              />
            ))}
          </View>

          {/* Bottom spacing for tab bar */}
          <View style={{ height: 90 }} />
        </Animated.View>
      </ScrollView>

      {/* ── Bottom Tab Bar ── */}
      <View style={styles.tabBar}>
        <SafeAreaView edges={["bottom"]} style={styles.tabBarSafe}>
          <View style={styles.tabBarInner}>
            {[
              { icon: "🏠", label: "Home", active: true },
              { icon: "🔍", label: "Browse", active: false },
              { icon: "📋", label: "Bookings", active: false },
              { icon: "👤", label: "Profile", active: false },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.label}
                style={styles.tabBarItem}
                activeOpacity={0.75}
              >
                <Text style={styles.tabBarIcon}>{tab.icon}</Text>
                <Text
                  style={[
                    styles.tabBarLabel,
                    tab.active && styles.tabBarLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
                {tab.active && <View style={styles.tabBarDot} />}
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Navbar ──
  navbar: {
    backgroundColor: COLORS.primary,
    zIndex: 10,
  },
  navSafe: {
    backgroundColor: COLORS.primary,
  },
  navInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navHamburger: {
    gap: 5,
    padding: 4,
  },
  hamLine: {
    width: 22,
    height: 2,
    backgroundColor: COLORS.neutral,
    borderRadius: 2,
  },
  navBrand: {
    fontFamily: FONTS.headline,
    fontSize: 20,
    color: COLORS.secondary,
    letterSpacing: 0.5,
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  navIconBtn: {
    padding: 4,
  },
  navIcon: {
    fontSize: 20,
  },
  // Placeholder avatar – remove when using real <Image>
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily: FONTS.label,
    fontSize: 15,
    color: COLORS.primary,
  },
  // Real avatar style – uncomment when replacing placeholder
  // avatar: {
  //   width: 36,
  //   height: 36,
  //   borderRadius: 18,
  // },

  // ── Scroll ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // ── Greeting ──
  greetingSection: {
    marginBottom: 18,
  },
  greetingText: {
    fontFamily: FONTS.headline,
    fontSize: 24,
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  greetingSubtext: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 3,
  },

  // ── Search ──
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 14.5,
    color: COLORS.textBody,
    paddingVertical: 0,
  },

  // ── Filter Chips ──
  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  filterChipActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.inputBg,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  filterChipIcon: {
    fontSize: 13,
  },
  filterChipTextActive: {
    fontFamily: FONTS.label,
    fontSize: 13,
    color: COLORS.neutral,
  },
  filterChipText: {
    fontFamily: FONTS.label,
    fontSize: 13,
    color: COLORS.textBody,
  },

  // ── Category Tabs ──
  tabsScroll: {
    marginHorizontal: -20,
    marginBottom: 16,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  tabWrapper: {
    alignItems: "center",
    paddingBottom: 8,
  },
  tabLabel: {
    fontFamily: FONTS.label,
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  tabLabelActive: {
    color: COLORS.secondary,
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    height: 2,
    width: "100%",
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
  },

  // ── Featured Card ──
  featuredCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  featuredImage: {
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
  },
  featuredOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
    // Simulates a dark gradient at the bottom
    backgroundColor: "rgba(10, 29, 55, 0.35)",
  },
  featuredBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.featuredBadge,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  featuredBadgeText: {
    fontFamily: FONTS.label,
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  featuredBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  featuredName: {
    fontFamily: FONTS.headline,
    fontSize: 19,
    color: COLORS.neutral,
    letterSpacing: 0.3,
  },
  featuredLocation: {
    fontFamily: FONTS.body,
    fontSize: 12.5,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  featuredPriceBox: {
    alignItems: "flex-end",
  },
  featuredPrice: {
    fontFamily: FONTS.headline,
    fontSize: 22,
    color: COLORS.tertiary,
  },
  featuredPriceSub: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
  },

  // ── Section Header ──
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: FONTS.headline,
    fontSize: 18,
    color: COLORS.primary,
  },
  sectionViewAll: {
    fontFamily: FONTS.label,
    fontSize: 11.5,
    color: COLORS.secondary,
    letterSpacing: 1,
  },

  // ── Room Grid ──
  roomGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  roomCard: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  roomImage: {
    height: 130,
    position: "relative",
  },
  heartBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.heartBg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  heartIcon: {
    fontSize: 16,
    color: COLORS.primary,
    lineHeight: 18,
  },
  roomInfo: {
    padding: 11,
    gap: 3,
  },
  roomCategory: {
    fontFamily: FONTS.label,
    fontSize: 9.5,
    color: COLORS.textMuted,
    letterSpacing: 1.1,
  },
  roomName: {
    fontFamily: FONTS.headlineReg,
    fontSize: 14.5,
    color: COLORS.primary,
    letterSpacing: 0.1,
  },
  roomPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  roomPrice: {
    fontFamily: FONTS.headline,
    fontSize: 16,
    color: COLORS.primary,
  },
  roomRating: {
    fontFamily: FONTS.label,
    fontSize: 11.5,
    color: COLORS.secondary,
  },

  // ── Bottom Tab Bar ──
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.navBg,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 14,
  },
  tabBarSafe: {
    backgroundColor: COLORS.navBg,
  },
  tabBarInner: {
    flexDirection: "row",
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 10,
  },
  tabBarItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    position: "relative",
  },
  tabBarIcon: {
    fontSize: 20,
  },
  tabBarLabel: {
    fontFamily: FONTS.body,
    fontSize: 10.5,
    color: "rgba(255,255,255,0.45)",
  },
  tabBarLabelActive: {
    color: COLORS.secondary,
  },
  tabBarDot: {
    position: "absolute",
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.secondary,
  },
});

export default HomePage;
