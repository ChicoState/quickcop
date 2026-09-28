import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
    borderRadius: 4,
    borderWidth: 1,
    minHeight: 52,
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
  helper: {
    color: "#BDBDBD",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  homeHeader: {
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  homeLogout: {
    padding: 8,
  },
  input: {
    borderBottomColor: "#7A7A7A",
    borderBottomWidth: 1,
    color: "#FFFFFF",
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 0,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  passwordLabel: {
    marginTop: 20,
  },
  link: {
    alignSelf: "center",
    marginTop: 24,
    padding: 8,
  },
  linkText: {
    color: "#FFFFFF",
    fontSize: 15,
    textDecorationLine: "underline",
  },
  screen: {
    backgroundColor: "#000000",
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  subtitle: {
    color: "#BDBDBD",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 36,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  validation: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 16,
  },
});
