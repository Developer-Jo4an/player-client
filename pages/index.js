import React from "react";
import PageDescription from "../components/baseComponents/head/pageDescription/PageDescription";
import defaultPage from "../constants/page-description";
import PixiPlayer from "../components/pixiPlayer/PixiPlayer";

export default function Home() {

  return (
    <div className="container">
      <PageDescription {...defaultPage}/>
      <PixiPlayer/>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {},
  };
}
