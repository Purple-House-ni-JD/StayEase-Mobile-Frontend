import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

const MENU_ITEMS = [
  { label: "Home", route: "pages/HomePage" },
  { label: "Bookings", route: "pages/BookingsPage" },
  { label: "Wishlist", route: "pages/WishlistPage" },
  { label: "Profile", route: "pages/ProfilePage" },
  { label: "Help & Support", route: "pages/HelpSupportPage" },
];

const HamburgerMenu = ({ visible, onClose }) => {
  const router = useRouter();

  const handleSelect = (route) => {
    onClose();
    router.push(route);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.panel}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.item}
              onPress={() => handleSelect(item.route)}
              activeOpacity={0.7}
            >
              <Text style={styles.itemLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-start",
  },
  panel: {
    marginTop: 72,
    marginHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#0A1D37",
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  itemLabel: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});

export default HamburgerMenu;
