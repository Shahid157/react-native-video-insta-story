import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  ActivityIndicator,
  View,
  Platform,
  SafeAreaView,
} from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';

import { usePrevious, isNullOrWhitespace } from './helpers';
import {
  IUserStoryItem,
  NextOrPrevious,
  StoryListItemProps,
} from './interfaces';
import Video from 'react-native-video';
import eyeIcon from './assets/images/eye-icon.png';
import fireIcon from './assets/images/fire_icon.png';

const { width, height } = Dimensions.get('window');

export const StoryListItem = ({
  index,
  key,
  userId,
  profileImage,
  profileName,
  duration,
  onFinish,
  onClosePress,
  stories,
  videoProps,
  currentPage,
  onStorySeen,
  renderCloseComponent,
  renderSwipeUpComponent,
  renderTextComponent,
  loadedAnimationBarStyle,
  unloadedAnimationBarStyle,
  animationBarContainerStyle,
  storyUserContainerStyle,
  storyImageStyle,
  storyAvatarImageStyle,
  storyContainerStyle,
  ...props
}: StoryListItemProps) => {
  const [load, setLoad] = useState<boolean>(true);
  const [pressed, setPressed] = useState<boolean>(false);
  const [content, setContent] = useState<IUserStoryItem[]>(
    stories.map((x) => ({
      ...x,
      finish: 0,
    })),
  );

  const [current, setCurrent] = useState(0);

  const progress = useRef(new Animated.Value(0)).current;

  const prevCurrentPage = usePrevious(currentPage);

  useEffect(() => {
    let isPrevious = !!prevCurrentPage && prevCurrentPage > currentPage;
    if (isPrevious) {
      setCurrent(content.length - 1);
    } else {
      setCurrent(0);
    }

    let data = [...content];
    data.map((x, i) => {
      if (isPrevious) {
        x.finish = 1;
        if (i == content.length - 1) {
          x.finish = 0;
        }
      } else {
        x.finish = 0;
      }
    });
    setContent(data);
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const prevCurrent = usePrevious(current);

  useEffect(() => {
    if (!isNullOrWhitespace(prevCurrent)) {
      if (prevCurrent) {
        if (
          current > prevCurrent &&
          content[current - 1].story_image == content[current].story_image
        ) {
          start();
        } else if (
          current < prevCurrent &&
          content[current + 1].story_image == content[current].story_image
        ) {
          start();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  function start() {
    setLoad(false);
    progress.setValue(0);
    startAnimation();
  }

  function startAnimation() {
    Animated.timing(progress, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        next();
      }
    });
  }

  function onSwipeUp(_props?: any) {
    if (onClosePress) {
      onClosePress();
    }
    if (content[current].onPress) {
      content[current].onPress?.();
    }
  }

  function onSwipeDown(_props?: any) {
    onClosePress();
  }

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  function next() {
    // check if the next content is not empty
    setLoad(true);
    if (current !== content.length - 1) {
      let data = [...content];
      data[current].finish = 1;
      setContent(data);
      setCurrent(current + 1);
      progress.setValue(0);
    } else {
      // the next content is empty
      close('next');
    }
  }

  function previous() {
    // checking if the previous content is not empty
    setLoad(true);
    if (current - 1 >= 0) {
      let data = [...content];
      data[current].finish = 0;
      setContent(data);
      setCurrent(current - 1);
      progress.setValue(0);
    } else {
      // the previous content is empty
      close('previous');
    }
  }

  function close(state: NextOrPrevious) {
    let data = [...content];
    data.map((x) => (x.finish = 0));
    setContent(data);
    progress.setValue(0);
    if (currentPage == index) {
      if (onFinish) {
        onFinish(state);
      }
    }
  }

  const swipeText =
    content?.[current]?.swipeText || props.swipeText || 'Swipe Up';

  React.useEffect(() => {
    if (onStorySeen && currentPage === index) {
      onStorySeen({
        user_id: userId,
        user_image: profileImage,
        user_name: profileName,
        story: content[current],
      });
    }
  }, [currentPage, index, onStorySeen, current]);

  return (
    <GestureRecognizer
      key={key}
      onSwipeUp={onSwipeUp}
      onSwipeDown={onSwipeDown}
      config={config}
      style={[styles.container, storyContainerStyle]}
    >
      {content[current].story_image ? (
        <SafeAreaView>
          <View style={styles.backgroundContainer}>
            <Image
              onLoadEnd={() => start()}
              source={{ uri: content[current].story_image }}
              style={[styles.image, storyImageStyle]}
            />
            <Video
              source={{ uri: content[current].story_video }}
              style={styles.backgroundVideo}
              {...videoProps}
            ></Video>
            {load && (
              <View style={styles.spinnerContainer}>
                <ActivityIndicator size="large" color={'white'} />
              </View>
            )}
          </View>
        </SafeAreaView>
      ) : (
        <View style={styles.backgroundContainer}>
          <Video
            source={{ uri: content[current]?.story_video }}
            style={styles.backgroundVideo}
            {...videoProps}
          ></Video>
          {load && (
            <View style={styles.spinnerContainer}>
              <ActivityIndicator size="large" color={'white'} />
            </View>
          )}
        </View>
      )}
      <View
        style={{
          marginTop: content[current]?.story_video ? 50 : 0,
          flex: 1,
          flexDirection: 'column',
        }}
      >
        <View
          style={[styles.animationBarContainer, animationBarContainerStyle]}
        >
          {content.map((index, key) => {
            return (
              <View
                key={key}
                style={[styles.animationBackground, unloadedAnimationBarStyle]}
              >
                <Animated.View
                  style={[
                    {
                      flex: current == key ? progress : content[key].finish,
                      height: 2,
                      backgroundColor: 'white',
                    },
                    loadedAnimationBarStyle,
                  ]}
                />
              </View>
            );
          })}
        </View>
        <View style={[styles.userContainer, storyUserContainerStyle]}>
          <View style={styles.flexRowCenter}>
            <Image
              style={[styles.avatarImage, storyAvatarImageStyle]}
              source={{ uri: profileImage }}
            />
            {typeof renderTextComponent === 'function' ? (
              renderTextComponent({
                item: content[current],
                profileName,
              })
            ) : (
              <Text style={styles.avatarText}>{profileName}</Text>
            )}
          </View>
          <View style={styles.closeIconContainer}>
            {typeof renderCloseComponent === 'function' ? (
              renderCloseComponent({
                onPress: onClosePress,
                item: content[current],
              })
            ) : (
              <TouchableOpacity
                onPress={() => {
                  if (onClosePress) {
                    onClosePress();
                  }
                }}
              >
                <Text style={styles.whiteText}>X</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.pressContainer}>
          <TouchableWithoutFeedback
            onPressIn={() => progress.stopAnimation()}
            onLongPress={() => setPressed(true)}
            onPressOut={() => {
              setPressed(false);
              startAnimation();
            }}
            onPress={() => {
              if (!pressed && !load) {
                previous();
              }
            }}
          >
            <View style={styles.flex} />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPressIn={() => progress.stopAnimation()}
            onLongPress={() => setPressed(true)}
            onPressOut={() => {
              setPressed(false);
              startAnimation();
            }}
            onPress={() => {
              if (!pressed && !load) {
                next();
              }
            }}
          >
            <View style={styles.flex} />
          </TouchableWithoutFeedback>
        </View>
      </View>
      {typeof renderSwipeUpComponent === 'function' ? (
        renderSwipeUpComponent({
          onPress: onSwipeUp,
          item: content[current],
        })
      ) : (
        <View style={styles.swipeUpBtn}>
          <Image style={styles.fireIconImage} source={fireIcon} />
          <Text style={styles.swipeText}>{content[current]?.story_likes}</Text>
          <View
            style={{
              borderRadius: 100,
              backgroundColor: 'rgba(52, 52, 52, 0.8)',
              padding: 5,
              marginRight: 5,
              height: 40,
              width: 40,
              justifyContent: 'center',
            }}
          >
            <Image
              resizeMode="cover"
              style={styles.eyeIconImage}
              source={eyeIcon}
            />
          </View>
          <Text style={styles.swipeText}>{content[current]?.story_views}</Text>
        </View>
      )}
    </GestureRecognizer>
  );
};

export default StoryListItem;

StoryListItem.defaultProps = {
  duration: 10000,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },

  flexRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  spinnerContainer: {
    zIndex: -100,
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: 'black',
    alignSelf: 'center',
    width: width,
    height: height,
  },
  animationBarContainer: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  animationBackground: {
    height: 2,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(117, 117, 117, 0.5)',
    marginHorizontal: 2,
  },
  userContainer: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  avatarImage: {
    marginTop: 20,
    height: 50,
    width: 50,
    borderRadius: 100,
    borderColor: '#8a99e3',
    borderWidth: 1,
  },
  avatarText: {
    fontWeight: 'bold',
    color: 'white',
    paddingLeft: 10,
    marginTop: 20,
  },
  closeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    paddingHorizontal: 15,
    marginTop: 5,
  },
  pressContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  swipeUpBtn: {
    flexDirection: 'row',
    position: 'absolute',
    opacity: 0.6,
    height: 50,
    width: 200,
    borderRadius: 10,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
    bottom: Platform.OS == 'ios' ? 120 : 100,
  },
  whiteText: {
    color: 'white',
  },
  swipeText: {
    color: 'white',
    marginTop: 5,
    fontSize: 18,
    textAlign: 'center',
    marginRight: 5,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  eyeIconImage: {
    width: 30,
    height: 30,
    alignSelf: 'center',
    tintColor: 'white',
    marginRight: 10,
    marginLeft: 10,
  },
  fireIconImage: {
    width: 40,
    height: 40,
    alignSelf: 'center',
    marginRight: 5,
    marginLeft: 5,
  },
});
