import { useState, useRef } from "react";
import { Animated, TouchableOpacity, StyleSheet } from "react-native";

const HeartButton = ({
  onLikeChange,
  initialLiked = false,
  size = "small",
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    onLikeChange?.(newLiked);

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
      style={[styles.heartBtn, size === "large" && styles.heartBtnLarge]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Animated.Text
        style={[
          styles.heartIcon,
          size === "large" && styles.heartIconLarge,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {liked ? "♥" : "♡"}
      </Animated.Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  heartBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    zIndex: 1,
  },
  heartBtnLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  heartIcon: {
    fontSize: 16,
    color: "#0A1D37",
    lineHeight: 18,
  },
  heartIconLarge: {
    fontSize: 20,
    lineHeight: 22,
  },
});

export default HeartButton;
