import React from 'react';
import { connect } from 'react-redux';

const Page: React.FC<any> = () => {
  return <div>HELLO</div>;
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});
export const NewReadingCovid = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);
