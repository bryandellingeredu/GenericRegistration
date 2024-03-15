import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default observer(function ThankYouForRegisteringFromLink() {

    const { encryptedKey } = useParams();
    const navigate = useNavigate();

return(
        <h1>Hello From Thank You For Registering From Link</h1>
      )
})