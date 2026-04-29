import { useState } from "react";
import { View, TextInput, StyleSheet, Text } from "react-native";
import { COLORS, FONTS } from "../constants/colors";

const SearchBar = ({
  initialValue = "",
  onSubmit,
  placeholder = "Search rooms...",
}) => {
  const [localValue, setLocalValue] = useState(initialValue);

  const handleSubmit = () => {
    onSubmit?.(localValue);
  };

  return (
    <View style={styles.searchBar}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={localValue}
        onChangeText={setLocalValue}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral,
    borderRadius: 60,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
    color: COLORS.textMuted,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textBody,
    paddingVertical: 0,
  },
});

export default SearchBar;
