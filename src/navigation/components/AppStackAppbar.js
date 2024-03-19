import React from 'react';
import StandardAppBar from '../../components/Appbar';
import AppBarAction from '../../components/Appbar/appBarAction';
import AppBarContent from '../../components/Appbar/appBarContent';
import {colors} from '../../utils/Colors';

function AppStackAppBar(props) {
  const {navigation, options} = props;
  const _onGoBack = () => {
    navigation.goBack();
  };
  return (
    <StandardAppBar
      style={[props.options.headerStyle,{justifyContent: 'space-around', alignItems: 'center'}]}
      children={
        <>
          {props.options.headerBackVisible && (
            <AppBarAction
              onPress={_onGoBack}
              color={colors.ORANGE}
              icon={'keyboard-backspace'}
            />
          )}
          <AppBarContent
            color={colors.APP_SECONDARY}
            title={options.title}
            titleStyle={options.headerTitleStyle}
          />
          {props.options.headerRight && (
            props.options.headerRight
          )}
        </>
      }
    />
  );
}

export default AppStackAppBar;
