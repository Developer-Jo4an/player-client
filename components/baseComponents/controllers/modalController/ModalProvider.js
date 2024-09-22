import React from "react";
import * as PropTypes from "prop-types";
import ModalController from "./modalController";
import {useModalValue} from "../../../../hooks/useModal";

export const ModalContext = React.createContext([]);

export default function ModalProvider({children, aliases}) {
  const [modals, value] = useModalValue(aliases);

  return (
    <ModalContext.Provider value={value}>
      {children}
      <ModalController Context={ModalContext} value={value} modals={modals}/>
    </ModalContext.Provider>
  );
}

ModalProvider.propTypes = {
  children: PropTypes.node,
  aliases: PropTypes.objectOf(
    PropTypes.shape({
      Modal: PropTypes.elementType.isRequired,
      props: PropTypes.object,
    })
  )
}

