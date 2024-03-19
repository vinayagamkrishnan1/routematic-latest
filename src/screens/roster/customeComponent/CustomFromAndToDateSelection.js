//import liraries
import React, {Component} from "react";
import {Button, SafeAreaView, StatusBar, StyleSheet, View} from "react-native";
import Calendar from 'react-native-calendar-select';
import {colors} from "../../../utils/Colors";
import moment from "moment";

class CustomFromAndToDateSelection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: null,
            endDate: null
        };
        this.confirmDate = this.confirmDate.bind(this);
        this.openCalendar = this.openCalendar.bind(this);
    }

    static navigationOptions = ({navigation}) => {
        return {
            //title: "Routematic",
            headerStyle: {display: "none"}
        };
    };


// when confirm button is clicked, an object is conveyed to outer component
// contains following property:
// startDate [Date Object], endDate [Date Object]
// startMoment [Moment Object], endMoment [Moment Object]
    confirmDate({startDate, endDate, startMoment, endMoment}) {
        this.setState({
            startDate,
            endDate
        });
        console.warn("From date "+startDate+" End Date "+endDate);
    }

    openCalendar() {
        this.calendar && this.calendar.open();
    }

    render() {
        let customI18n = {
            'w': ['', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
            'weekday': ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            'text': {
                'start': 'Check in',
                'end': 'Check out',
                'date': 'Date',
                'save': 'Confirm',
                'clear': 'Reset'
            },
            'date': 'DD / MM'  // date format
        };
        let color = {
            mainColor:colors.BLUE,
            subColor: colors.WHITE
        };
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.WHITE}}>
                <View style={styles.container}>
                    <StatusBar
                        translucent={false}
                        backgroundColor={colors.WHITE}
                        barStyle="dark-content"
                    />
                        <Calendar
                            i18n="en"
                            ref={(calendar) => {
                                this.calendar = calendar;
                            }}
                            customI18n={customI18n}
                            color={color}
                            format="YYYYMMDD"
                            minDate={moment().format()}
                            maxDate={moment()
                                .add( 90, "days")
                                .format()}
                            startDate={this.state.startDate}
                            endDate={this.state.endDate}
                            onConfirm={this.confirmDate}
                        />
                    <Button title="Open Calendar" onPress={() => {
                        this.openCalendar()
                    }}/>
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: colors.WHITE
    }
});


//make this component available to the app
export default CustomFromAndToDateSelection;
