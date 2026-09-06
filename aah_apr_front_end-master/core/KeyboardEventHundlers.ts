import { IsNotANullValue } from "@/constants/Constants";
import {
  SUBMIT_BUTTON_PROVIDER_ID,
  DELETE_BUTTON_PROVIDER_ID,
  SELECT_ALL_BUTTON_PROVIDER,
  SIDEBAR_OPEN_TOGGLER_PROVIDER,
  ARROW_RIGHT_BUTTON_PROVIDER,
  ARROW_LEFT_BUTTON_PROVIDER,
} from "@/config/System";

class KeyboardEventHandlers {
  /**
   * When the enter button is being pressed the method will checks if there is a button with id SUBMIT_BUTTON _PROVIDER_ID.
   * If it find some. it will click on it otherwise it will do nothing.
   */

  onEnterPressed() {
    const submitBtn = document.getElementById(SUBMIT_BUTTON_PROVIDER_ID);

    if (IsNotANullValue(submitBtn)) submitBtn?.click();
  }

  /**
   * When the delete button i being pressed the method will checks if there is a button with id DELETE_BUTTON_PROVIDER_ID.
   * If it find some. it will click on it otherwise it will do nothing.
   */

  onDeletePressed() {
    const deleteBtn = document.getElementById(DELETE_BUTTON_PROVIDER_ID);

    if (IsNotANullValue(deleteBtn)) deleteBtn?.click();
  }

  /**
   * When the Ctrl + A button is being pressed the method will checks if there is a button with id SELECT_ALL_BUTTON_PROVIDER.
   * If it find some. it will click on it otherwise it will do nothing.
   */

  onCtrlPlusAPressed() {
    const selectAllBtn: HTMLElement | null = document.getElementById(
      SELECT_ALL_BUTTON_PROVIDER,
    );

    if (IsNotANullValue(selectAllBtn)) selectAllBtn?.click();
  }

  /**
   * When the Ctrl + B button is being pressed the method will checks if there is a button with id SIDEBAR_OPEN_TOGGLER_PROVIDER.
   * If it find some. it will click on it otherwise it will do nothing.
   */

  onCtrlPlusBPressed() {
    const sideBarOpenerButton = document.getElementById(
      SIDEBAR_OPEN_TOGGLER_PROVIDER,
    );

    if (IsNotANullValue(sideBarOpenerButton)) sideBarOpenerButton?.click();
  }

  /**
   * When the arrow right button is being pressed the method will checks if there is a button with id ARROW_RIGHT_BUTTON_PROVIDER.
   * if it find some. it will click on it otherwise it will do nothing.
   */

  onArrowRightPressed() {
    const nextButton = document.getElementById(ARROW_RIGHT_BUTTON_PROVIDER);
    if (IsNotANullValue(nextButton)) nextButton?.click();
  }

  /**
   * When the arrow right button is being pressed the method will checks if there is a button with id ARROW_LEFT_BUTTON_PROVIDER.
   * if it find some. it will click on it otherwise it will do nothing.
   */

  onArrowLeftPressed() {
    const backButton = document.getElementById(ARROW_LEFT_BUTTON_PROVIDER);
    if (IsNotANullValue(backButton)) backButton?.click();
  }
}

export default KeyboardEventHandlers;
