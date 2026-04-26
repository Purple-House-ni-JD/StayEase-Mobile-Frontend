import {
  TouchableOpacity,
  ImageBackground,
  Text,
  View,
  StyleSheet,
} from "react-native";
import HeartButton from "./HeartButton";
import { COLORS, FONTS } from "../constants/colors";

const RoomCard = ({ item, onPress, cardWidth }) => (
  <TouchableOpacity
    style={[styles.roomCard, { width: cardWidth }]}
    onPress={onPress}
    activeOpacity={0.9}
  >
    {item.image ? (
      <ImageBackground
        source={item.image}
        style={styles.roomImage}
        imageStyle={styles.roomImageRadius}
        resizeMode="cover"
      >
        <HeartButton />
      </ImageBackground>
    ) : (
      <View style={[styles.roomImage, styles.roomImagePlaceholder]}>
        <HeartButton />
      </View>
    )}

    <View style={styles.roomInfo}>
      <Text style={styles.roomCategory}>{item.category}</Text>
      <Text style={styles.roomName}>{item.name}</Text>
      <View style={styles.roomPriceRow}>
        <Text style={styles.roomPrice}>₱{item.price}</Text>
        <Text style={styles.roomRating}>★ {item.rating}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  roomCard: {
    backgroundColor: COLORS.neutral,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    marginBottom: 16,
  },
  roomImage: {
    height: 140,
    justifyContent: "flex-start",
  },
  roomImageRadius: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  roomImagePlaceholder: {
    backgroundColor: COLORS.backgroundSoft,
  },
  roomInfo: {
    padding: 14,
  },
  roomCategory: {
    fontFamily: FONTS.label,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  roomName: {
    fontFamily: FONTS.headlineReg,
    fontSize: 15,
    color: COLORS.primary,
    lineHeight: 20,
  },
  roomPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 9,
  },
  roomPrice: {
    fontFamily: FONTS.headline,
    fontSize: 16,
    color: COLORS.primary,
  },
  roomRating: {
    fontFamily: FONTS.label,
    fontSize: 12,
    color: COLORS.secondary,
  },
});

export default RoomCard;
