export default (colors) => ({
  textSectionTitleColor: "#b6c1cd",
  textSectionTitleDisabledColor: "#d9e1e8",
  selectedDayBackgroundColor: '#4a90e2',
  selectedDayTextColor: "#FFF",
  todayTextColor: "#1767B2",
  dayTextColor: "#2d4150",
  textDisabledColor: "#d9e1e8",
  // Main Calendar Container Style
  "stylesheet.calendar.main": {
    container: {
      backgroundColor: "white",
      borderTopEndRadius: 10,
      borderTopStartRadius: 10,
    },
  },
  // Calendar Header Style
  "stylesheet.calendar.header": {
    week: {
      marginTop: 7,
      flexDirection: "row",
      justifyContent: "space-around",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dayHeader: {
      marginTop: 2,
      marginBottom: 7,
      width: 32,
      textAlign: "center",
    },
  },
});
