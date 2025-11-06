/**
 * PageHeader Component
 *
 * Reusable header component for all pages
 * Makes it easy to maintain consistent styling across the app
 *
 * Usage:
 * <PageHeader
 *   title="หน้าหลัก"
 *   subtitle="คำอธิบาย"
 *   rightContent={<SomeComponent />}
 * />
 */

export const PageHeader = ({
  title,
  subtitle,
  rightContent,
  className = ''
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">{title}</h1>
          {subtitle && <p className="text-text-muted">{subtitle}</p>}
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
