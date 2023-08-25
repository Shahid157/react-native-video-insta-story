import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  ImageBackground,
  TouchableWithoutFeedback,
} from 'react-native';

import { usePrevious } from './helpers/StateHelpers';
import { IUserStory, StoryCircleListItemProps } from './interfaces';
import DEFAULT_AVATAR from './assets/images/no_avatar.png';
import eyeIcon from './assets/images/eye-icon.png';

const StoryCircleListItem = ({
  item,
  unPressedBorderColor,
  pressedBorderColor,
  unPressedAvatarTextColor,
  pressedAvatarTextColor,
  avatarSize = 60,
  showText,
  avatarTextStyle,
  handleStoryItemPress,
  avatarImageStyle,
  avatarWrapperStyle,
}: StoryCircleListItemProps) => {
  const [isPressed, setIsPressed] = useState(item?.seen);

  const prevSeen = usePrevious(item?.seen);

  useEffect(() => {
    if (prevSeen != item?.seen) {
      setIsPressed(item?.seen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.seen]);

  const _handleItemPress = (item: IUserStory) => {
    if (handleStoryItemPress) handleStoryItemPress(item);

    setIsPressed(true);
  };

  const avatarWrapperSize = avatarSize + 4;

  return (
    <TouchableWithoutFeedback onPress={() => _handleItemPress(item)}>
      <ImageBackground
        style={styles.imageContainer}
        imageStyle={styles.imageStyle}
        source={{ uri: item.user_image }}
      >
        <TouchableOpacity
          onPress={() => _handleItemPress(item)}
          style={[
            styles.avatarWrapper,
            {
              height: avatarWrapperSize,
              width: avatarWrapperSize,
            },
            avatarWrapperStyle,
            !isPressed
              ? {
                  borderColor: unPressedBorderColor ?? '#8a99e3',
                }
              : {
                  borderColor: pressedBorderColor ?? 'grey',
                },
          ]}
        >
          <Image
            style={[
              {
                height: avatarSize,
                width: avatarSize,
                borderRadius: 100,
              },
              avatarImageStyle,
            ]}
            source={{ uri: item.user_image }}
            defaultSource={Platform.OS === 'ios' ? DEFAULT_AVATAR : null}
          />
        </TouchableOpacity>
        {showText && (
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.text}>
            @{item.user_name}
          </Text>
        )}
        <View style={styles.viewsContainer}>
          <Image style={styles.eyeIconImage} source={eyeIcon} />
          <Text style={styles.viewCountTextStyle}>
            {item?.views ? item?.views : ''} Views
          </Text>
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

export default StoryCircleListItem;

const styles = StyleSheet.create({
  avatarWrapper: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: 'red',
    borderRadius: 100,
    height: 64,
    width: 64,
  },
  text: {
    textAlign: 'center',
    color: 'white',
    fontSize: 11,
    marginTop: 5,
  },
  imageContainer: {
    width: 125,
    height: 160,
    alignSelf: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  imageStyle: { borderRadius: 15, opacity: 0.7 },
  viewsContainer: {
    flexDirection: 'row',
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    bottom: 5,
    alignSelf: 'center',
  },
  eyeIconImage: {
    width: 15,
    height: 15,
    alignSelf: 'center',
    tintColor: 'white',
  },
  viewCountTextStyle: {
    marginTop: 3.5,
    marginLeft: 3,
    fontSize: 10,
    color: 'white',
  },
});
