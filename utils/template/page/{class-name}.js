import React from 'react';
import PageDescription from "../components/baseComponents/head/pageDescription/PageDescription";
import defaultPage from "../constants/page-description";

export default function <%-ClassName%>Page() {
  return (
    <>
      <PageDescription {...defaultPage}/>
      {"your content here..."}
    </>
  );
}
