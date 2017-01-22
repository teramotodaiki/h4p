import React, { PureComponent, PropTypes } from 'react';
import { Card, CardHeader, CardActions, CardText } from 'material-ui/Card';


import { commonRoot } from './commonStyles';
import shallowEqual from '../utils/shallowEqual';
import uniqueBy from '../utils/uniqueBy';

export default class CreditsCard extends PureComponent {

  static propTypes = {
    files: PropTypes.array.isRequired,
    localization: PropTypes.object.isRequired,
  };

  state = {
    credits: this.getCredits(),
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.files !== nextProps) {
      const next = this.getCredits();
      if (!shallowEqual(this.state.credits, next)) {
        this.setState({
          credits: next,
        });
      }
    }
  }

  getCredits() {
    const credits = this.props.files
      .reduce((p, c) => p.concat(c.credits), [])
      .sort((a, b) => a.timestamp > b.timestamp);

    return uniqueBy(credits, 'label');
  }

  renderCredit(credit) {
    return (
      <div key={credit.hash}>
      {credit.url ? (
        <a href={credit.url} target="_blank">{credit.label}</a>
      ) : (
        <span>{credit.label}</span>
      )}
      </div>
    );
  }

  render() {
    return (
      <Card style={commonRoot}>
        <CardHeader showExpandableButton actAsExpander
          title={"Credits"}
          subtitle={"Credits of these files"}
        />
        <CardText expandable
        >
        {this.state.credits.map(this.renderCredit)}
        </CardText>
      </Card>
    );
  }
}
