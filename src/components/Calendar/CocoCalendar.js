import React, {useRef} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {IconButton, useTheme} from 'react-native-paper';
import CalendarHeader from './CalendarHeader';
import CalendarTheme from './CalendarTheme';

function CocoCalendar({
  /** Initially visible month in 'yyyy-MM-dd' format. Default = now */
  current,
  /** Initially visible month. If changed will initialize the calendar to this value */
  initialDate,
  /** Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined */
  minDate,
  /** Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined */
  maxDate,
  /** If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday. */
  firstDay,
  /** Collection of dates that have to be marked. Default = {} */
  markedDates,
  /** Handler which gets executed on day press. Default = undefined */
  onDayPress,
  hideArrows,
  /** Replace default month and year title with custom one. the function receive a date as parameter */
  renderHeader,
  /** Style passed to the header */
  headerStyle,
  hideExtraDays,
  /** Custom footer component with two actions "cancel / ok" */
  renderFooter,
  /** Enable the option to swipe between months. Default: false */
  enableSwipeMonths,
  disableAllTouchEventsForDisabledDays,
  onVisibleMonthsChange,
  onMonthChange,
  markingType,
}) {
  const {colors} = useTheme();
  const calendarRef = useRef(null);
 
  return (
    <View>
      <Calendar
      style={{width:"100%"}}
        theme={CalendarTheme(colors)}
        ref={calendarRef}
      //  markingType={markingType}
        current={current}
        initialDate={initialDate}
        minDate={minDate}
        maxDate={maxDate}
        firstDay={firstDay}
        markedDates={markedDates}
        onDayPress={onDayPress}
        hideArrows={false}
        renderArrow={(direction) => {
          if (direction == 'left') {

              return ( <IconButton
              icon={'chevron-left'}
              size={30}
              color={'#4a90e2'}
            />
            )
          } else {
              return (<IconButton
                icon={'chevron-right'}
                size={30}
                color={'#4a90e2'}
              />)
          }
      }}
       //renderArrow={this._renderArrow}
        renderHeader={date => (
          <CalendarHeader
            date={date}
            // onNextMonth={() => {
            //   if (calendarRef) {
            //     calendarRef.current.addMonth(1);
            //   }
            // }}
            // onPreviousMonth={() => {
            //   if (calendarRef) {
            //     calendarRef.current.addMonth(-1);
            //   }
            // }}
          />
        )}
        headerStyle={headerStyle}
        hideExtraDays={true}
        enableSwipeMonths={true}
        disableAllTouchEventsForDisabledDays={
          disableAllTouchEventsForDisabledDays
        }
        onMonthChange={onMonthChange}
        onVisibleMonthsChange={onVisibleMonthsChange}
      />
      <View>{renderFooter}</View>
    </View>
  );
}

export default CocoCalendar;
