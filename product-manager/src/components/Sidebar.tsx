import {
  LayoutDashboard,
  Package,
  FolderTree,
  Image,
  Link,
  BarChart3,
  Settings
} from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
}

export function Sidebar() {
  const navItems: NavItem[] = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Package size={20} />, label: 'Sản phẩm', path: '/products', active: true },
    { icon: <FolderTree size={20} />, label: 'Danh mục', path: '/categories' },
    { icon: <Image size={20} />, label: 'Hình ảnh', path: '/media' },
    { icon: <Link size={20} />, label: 'Liên kết', path: '/links' },
    { icon: <BarChart3 size={20} />, label: 'Báo cáo', path: '/reports' },
    { icon: <Settings size={20} />, label: 'Cài đặt', path: '/settings' },
  ];

  return (
    <aside className="w-60 bg-white border-r border-gray-200">
      <nav className="py-6">
        {navItems.map((item, index) => (
          <div
            key={index}
            className={`
              px-6 py-3 flex items-center gap-3 cursor-pointer transition-all text-sm
              ${
                item.active
                  ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}
