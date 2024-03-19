import React, {Component} from "react";
import {
    Alert,
    Animated,
    AppRegistry,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import {CalendarList} from "react-native-calendars";
import moment from "moment";
import {colors} from "../../utils/Colors";

class CalendarPickerCallBack extends Component {
  static navigationOptions = {
    title: "Select date"
  };
  constructor(props) {
    super(props);
    this.state = {
      markedDates: this.getDaysInMonth(moment().month(), moment().year(), []),
      DISABLED_DAYS: [],
      AvailableRosters:
        "2018-08-09|2018-08-10|2018-08-11|2018-08-12|2018-08-13|2018-08-14|2018-08-15|2018-08-16|2018-08-17|2018-08-18|2018-08-19|2018-08-20|2018-08-21|2018-08-22|2018-08-23|2018-09-03|2018-09-04|2018-09-06|2018-09-07|2018-09-10|2018-09-11|2018-09-12|2018-09-13|2018-09-14|2018-09-15|2018-09-16|2018-09-17"
    };
  }
  componentDidMount() {
    this.setState({
      markedDates: this.getDaysInMonth(moment().month(), moment().year(), [
        "saturday"
      ])
    });
  }
  render() {
    if (!this.state.AvailableRosters) return;
    let dateArray;
    dateArray = this.state.AvailableRosters.split("|");
    let dates = {};
    dateArray.forEach(val => {
      dates[val] = {
        textColor: colors.WHITE,
        selected: true,
        selectedColor: colors.BLUE
      };
    });

    //Merging Two array
    let newDates = Object.assign(/*this.state.markedDates,*/ dates);
    return (
      <View>
        <CalendarList
          style={{ width: "100%", height: "100%" }}
          minDate={moment().toISOString()}
          markedDates={newDates}
          displayLoadingIndicator={false}
          markingType={"multi-dot"}
          hideExtraDays={true}
          onDayPress={day => {
            this.setState({
              RosterDate: day.dateString,
              FromDate: day.dateString
            });

            this.startDatePicker.dismiss();
          }}
          onVisibleMonthsChange={date => {
            let a = this.getDaysInMonth(
              date[0].month - 1,
              date[0].year,
              this.state.DISABLED_DAYS
            );

            let b = this.getDaysInMonth(
              date[0].month,
              date[0].year,
              this.state.DISABLED_DAYS
            );

            let c = this.getDaysInMonth(
              date[0].month + 1,
              date[0].year,
              this.state.DISABLED_DAYS
            );

            let combo = Object.assign(a, b, c);
            this.setState({ markedDates: combo });
          }}
          pastScrollRange={
            1 // Max amount of months allowed to scroll to the past. Default = 50
          }
          futureScrollRange={
            1 // Max amount of months allowed to scroll to the future. Default = 50
          }
          scrollEnabled={
            true // Enable or disable scrolling of calendar list
          }
          showScrollIndicator={
            true // Enable or disable vertical scroll indicator. Default = false
          }
        />
      </View>
    );
  }
  getDaysInMonth(month, year, days) {
    let pivot = moment()
      .month(month)
      .year(year)
      .startOf("month");
    const end = moment()
      .month(month)
      .year(year)
      .endOf("month");

    let dates = {};
    const disabled = { disabled: true, disableTouchEvent: true };
    while (pivot.isBefore(end)) {
      days.forEach(day => {
        dates[pivot.day(day).format("YYYY-MM-DD")] = disabled;
      });
      pivot.add(7, "days");
    }

    return dates;
  }
}

CalendarPickerCallBack.propTypes = {};

export default CalendarPickerCallBack;
