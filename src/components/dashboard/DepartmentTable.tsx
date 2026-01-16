function DepartmentTable({ departments }: { departments: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gradient-to-r from-indigo-50/70 to-blue-50/70 text-center">
          <tr>
            <th className="p-3">รหัส</th>
            <th className="p-3">ชื่อหน่วยงาน</th>
            <th className="p-3">หัวหน้าหน่วยงาน</th>
            <th className="p-3">พนักงาน</th>
            <th className="p-3">โครงการ</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((d) => (
            <tr key={d.code} className=" hover:bg-gray-50 text-center">
              <td className="p-3 font-medium">{d.code}</td>
              <td className="p-3">{d.name}</td>
              <td className="p-3">{d.leader}</td>
              <td className="p-3">{d.employees}</td>
              <td className="p-3">{d.projects}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default DepartmentTable;