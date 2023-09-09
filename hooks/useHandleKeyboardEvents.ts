import {useEffect, useRef} from 'react';
import {
  Animated,
  EmitterSubscription,
  Keyboard,
  useWindowDimensions,
} from 'react-native';
import {FALLBACK_CONTENT_WRAPPER_HEIGHT} from '../constant';

type HookReturn = {
  /**
   * Removes all keyboard listeners, typically when sheet is closed
   */
  removeKeyboardListeners: () => void;
};

/**
 * Function type
 */
type UseHandleKeyboardEvents = (
  heightTo: number,
  sheetOpen: boolean,
  HeightAnimator: any,
) => HookReturn;

type HeightAnimationDriver = (
  height: number,
  duration: number,
) => Animated.CompositeAnimation;

/**
 * Handles keyboard pop up adjusts sheet's layout when TextInput within
 * the sheet receives focus.
 *
 * @param {number} sheetHeight Initial sheet's height before keyboard pop out
 * @param {boolean} sheetOpen Indicates whether the sheet is open or closed
 * @param {HeightAnimationDriver} heightAnimationDriver Animator function to be called with new
 * sheet height when keyboard is out so it can adjust the sheet height with animation
 */
const useHandleKeyboardEvents: UseHandleKeyboardEvents = (
  sheetHeight: number,
  sheetOpen: boolean,
  heightAnimationDriver: HeightAnimationDriver,
) => {
  const SCREEN_HEIGHT = useWindowDimensions().height;
  const keyboardHideSubscription = useRef<EmitterSubscription>();
  const keyboardShowSubscription = useRef<EmitterSubscription>();

  useEffect(() => {
    keyboardShowSubscription.current = Keyboard.addListener(
      'keyboardDidShow',
      ({endCoordinates: {height: keyboardHeight}}) => {
        if (sheetOpen) {
          const height = Math.max(
            sheetHeight - keyboardHeight,
            FALLBACK_CONTENT_WRAPPER_HEIGHT,
          );
          heightAnimationDriver(height, 200).start();
        }
      },
    );
    keyboardHideSubscription.current = Keyboard.addListener(
      'keyboardDidHide',
      evt => {
        if (sheetOpen) heightAnimationDriver(sheetHeight, 200).start();
      },
    );

    return () => {
      keyboardHideSubscription.current?.remove();
      keyboardShowSubscription.current?.remove();
    };
  }, [sheetHeight, SCREEN_HEIGHT, sheetOpen, heightAnimationDriver]);

  return {
    removeKeyboardListeners() {
      keyboardShowSubscription.current?.remove();
      keyboardShowSubscription.current?.remove();
    },
  };
};

export default useHandleKeyboardEvents;