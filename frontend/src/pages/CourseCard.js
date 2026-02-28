import "./CourseCard.css";

function CourseCard({
  course,
  isPurchased,
  onPurchase,
  onView,
  index,
}) {
  const { title, description, price, _id, icon: Icon } = course;

  // FIX: Guard against Icon being undefined/null to prevent runtime crash
  const SafeIcon = Icon || (() => null);

  const handleClick = () => {
    if (isPurchased) {
      onView(_id);
    } else {
      onPurchase(_id);
    }
  };

  return (
    <div
      className="course-card"
      style={{ "--delay": `${index * 100}ms` }}
    >
      <div className="course-card__overlay" />

      <div className="course-card__content">
        <div className="course-card__icon">
          <SafeIcon size={32} />
        </div>

        <h3 className="course-card__title">{title}</h3>

        <p className="course-card__description">{description}</p>

        <div className="course-card__pricing">
          {/* FIX: Guard against undefined price */}
          <span className="course-card__price">
            {price !== undefined ? `₹${price}` : "Free"}
          </span>
        </div>

        <button
          onClick={handleClick}
          className={`course-card__button ${
            isPurchased ? "course-card__button--purchased" : ""
          }`}
        >
          {isPurchased ? "View Course" : "Buy Now"}
        </button>
      </div>
    </div>
  );
}

export default CourseCard;