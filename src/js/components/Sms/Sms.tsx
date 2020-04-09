import * as React from 'react';
import Button from '../Button';
import { formatNumWithLeadZero } from '../../helpers';

interface ISmsProps {
  onReset: () => void;
  onTimerEnd?: () => void;
  buttonText?: string;
}

const startTime = 60;

export default class Sms extends React.Component<ISmsProps> {
  state = {
    time: startTime,
  };
  timeoutId: NodeJS.Timeout = null;

  resetTimer = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }

    this.setState({ time: startTime });
  }

  decreaseTime = () => this.setState({
    time: this.state.time - 1,
  })

  clear() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  componentWillUnmount() {
    this.clear();
  }

  render() {
    const { onTimerEnd, buttonText } = this.props;
    const { time } = this.state;
    const minutes = formatNumWithLeadZero(Math.floor(time / 60));
    const seconds = formatNumWithLeadZero(time % 60);

    if (time > 0) {
      this.clear();
      this.timeoutId = setTimeout(() => this.decreaseTime(), 1000);
    } else if (onTimerEnd) {
      onTimerEnd();
    }

    return (
      <div className='sms'>
        {time
          ? (
            <div className='sms__timer'>
              {buttonText && <Button text={buttonText} onClick={this.resetTimer} />}
              Выслать повторно через
              <span>{`${minutes}:${seconds}`}</span>
            </div>
          ) : (
            <Button
              text='Выслать повторно'
              type='light'
              onClick={this.resetTimer} />
          )
        }
      </div>
    );
  }
}
