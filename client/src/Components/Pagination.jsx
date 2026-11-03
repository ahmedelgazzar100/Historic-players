import "../styling/Pagination.css";

export default function Pagination({ totalPages, currentPage, onPageChange }) {
  // لو مفيش صفحات أو صفحة واحدة بس مش بنعرض حاجة
  if (!totalPages || totalPages <= 1) return null;

  // دالة بسيطة لإنشاء مصفوفة الأرقام والـ "..."
  const getPageNumbers = () => {
    const pages = [];

    // لو عدد الصفحات 5 أو أقل، نعرضهم كلهم
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    // دائماً نبدأ بصفحة 1
    pages.push(1);

    // حساب بداية ونهاية الأرقام اللي حولين الصفحة الحالية
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    // لو في البداية
    if (currentPage <= 3) {
      end = 4;
    }
    // لو في النهاية
    if (currentPage >= totalPages - 2) {
      start = totalPages - 3;
    }

    // إضافة "..." قبل الأرقام لو فيه فرق
    if (start > 2) pages.push("...");

    // إضافة الأرقام اللي في النص
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // إضافة "..." بعد الأرقام لو فيه فرق
    if (end < totalPages - 1) pages.push("...");

    // دائماً ننهي بآخر صفحة
    pages.push(totalPages);

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="pagination-container">
      <div className="pagination">
        {/* زر السابق */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          «
        </button>

        {/* أرقام الصفحات */}
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <span key={`dots-${index}`} className="ellipsis">
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              className={page === currentPage ? "active" : ""}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          );
        })}

        {/* زر التالي */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          »
        </button>
      </div>
    </div>
  );
}
