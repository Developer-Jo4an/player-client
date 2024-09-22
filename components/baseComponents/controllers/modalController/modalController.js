import React, {useEffect, useRef} from "react";
import * as PropTypes from "prop-types";
import {CSSTransition, TransitionGroup} from "react-transition-group";

export default function ModalController({Context, value, modals}) {

  const scrollTop = useRef(null);

  const isModals = modals.length > 0;

  /**
   * добавление класса scroll-disabler на body
   */
  useEffect(() => {
    const DISABLER = "scroll-disabler";
    const {body, scrollingElement, documentElement} = document;
    const _scrollingElement = scrollingElement || documentElement;

    if (!isModals) {
      if (!body.classList.contains(DISABLER)) return;

      body.classList.remove(DISABLER);
      body.style.removeProperty("top");

      _scrollingElement.scrollTop = scrollTop.current;
    } else {
      const scrollTopValue = _scrollingElement.scrollTop;
      scrollTop.current = scrollTopValue;

      body.classList.add(DISABLER);
      body.style.top = `-${scrollTopValue}px`;
    }
  }, [isModals]);

  return (
    <TransitionGroup component={null}>
      {
        modals.map(({modal, ...info}) => (
          <CSSTransition classNames="custom-modal" timeout={{enter: 500, exit: 500}} key={info.id}>
            <Context.Provider value={{...value, ...info}}>
              {modal}
            </Context.Provider>
          </CSSTransition>
        ))
      }
    </TransitionGroup>
  )
}

ModalController.propTypes = {
  Context: PropTypes.object,
  value: PropTypes.object,
  modals: PropTypes.array,
};
