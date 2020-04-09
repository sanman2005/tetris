import * as React from 'react';
import Icons from '../icons';
import Progress from '../Progress';
import cn from 'classnames';

interface ILikesProps {
  likes: number;
  dislikes: number;
  onClick(value: number): void;
}

interface ILikesState {}

class Likes extends React.Component<ILikesProps, ILikesState> {
  render() {
    const { likes, dislikes, onClick } = this.props;
    const likesBalance = (likes / (likes + dislikes)) * 100;

    const likeElement = (isDislike?: boolean) => {
      const likeClass = cn('likes__ico', {
        'likes__ico--dislike': isDislike,
      });

      return (
        <div className='likes__like'>
          <span onClick={() => onClick(isDislike ? -1 : 1)}>
            <Icons.like className={likeClass} />
          </span>
          <span className='likes__count'>
            {isDislike ? dislikes : likes}
          </span>
        </div>
      );
    };

    return (
      <div className='likes__wrapper'>
        <div className='likes'>
          {likeElement()}
          {likeElement(true)}
        </div>
        <div className='likes__progress'>
          <Progress value={likesBalance} />
        </div>
      </div>
    );
  }
}

export default Likes;
