import { useAuth } from "../context/AuthContext";
const Header = ({ toggle }: { toggle: () => void }) => {
  const {  user } = useAuth();
  const shortEmail = (email?: string) => {
  if (!email) return "";
  return email.length > 6 ? email.slice(0, 6) + "..." : email;
};

  
  return (
    <header className="header">

      <div className="logo"><img src="https://www.emiant.in/static/images/Emiant%20logo%203@4x.png" /> </div>
      <div className="user">{shortEmail(user?.email)}
         <button className="menu-btn" onClick={toggle}>
        ☰
      </button>
</div>
       
    </header>
  );
};

export default Header;
