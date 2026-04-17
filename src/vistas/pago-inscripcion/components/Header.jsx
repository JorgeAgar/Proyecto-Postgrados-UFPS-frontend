import { UserIcon, ChevronDownIcon} from "@heroicons/react/24/outline";
import logo  from "../../../assets/logoufpsvertical.png";
function Header() {
  return (
    <div className="bg-red-700 text-white px-6 py-4 flex justify-between">
            <div className="flex items-center gap-3">
        <img
          src={logo}
          alt="UFPS"
          className="h-15 object-contain"
        />

        <div className="leading-tight">
          <p className="font-semibold text-2xl">Posgrados</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <UserIcon className="w-5 h-5" />
        <span>Juan Pérez</span>
        <ChevronDownIcon className="w-5 h-5 " />
      </div>
    </div>
  );
}

export default Header;