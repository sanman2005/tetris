import * as React from 'react';
import { observer } from 'mobx-react';
import Slider from '../Slider';
import Review, { IReview } from '../../models/review';
import { ModelStatus } from '../../models';
import Loading from '../Loading';
import Icons from '../icons';

export default observer(() => {
  const reviews = Review.all();

  if (!reviews.value || reviews.status !== ModelStatus.success) {
    return reviews.status === ModelStatus.fetching && <Loading />;
  }

  const itemClass = 'review';
  const items = reviews.value;

  const slidesReview = items.map((item: IReview, index: number) => {
    const { user } = item;
    const userName = user && user.name;
    const userPhoto = user && user.photo;
    const teacher = item.class && item.class.teacher;
    const teacherName = teacher && teacher.name;
    const teacherPhoto = teacher && teacher.photo;

    return (
      <div className={itemClass} key={`${itemClass}-${index}`}>
        <div className={`${itemClass}__class block-dark`}>
          <div className={`${itemClass}__class-photo`}>
            <img src={teacherPhoto} alt={teacherName} />
          </div>
          <div className={`${itemClass}__class-content`}>
            <div className={`${itemClass}__class-name`}>{teacherName}</div>
            <div className={`${itemClass}__class-title`}>
              {item.class.title}
            </div>
          </div>
        </div>
        <div className={`${itemClass}__content`}>
          <div className={`${itemClass}__text`} dangerouslySetInnerHTML={{ __html: item.text }} />
          <div className={`${itemClass}__author`}>
            <div className={`${itemClass}__photo`}>
              { userPhoto ? <img src={ userPhoto } alt={ userName } />
                : <div className={`${itemClass}__photo--empty`}>
                  <Icons.noPhoto />
                </div>
              }
            </div>
            <div className={`${itemClass}__name`}>{user && user.name}</div>
          </div>
        </div>
      </div>
    );
  });

  const sliderProps = {
    items: slidesReview,
    className: 'reviews row',
    countLg: 2,
    countMd: 2,
    countSm: 2,
    countXs: 1,
  };

  return !!slidesReview.length && <Slider { ...sliderProps } />;
});
