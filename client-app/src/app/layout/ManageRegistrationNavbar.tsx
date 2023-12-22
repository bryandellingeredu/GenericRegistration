import { Dropdown, Icon, Menu } from "semantic-ui-react";
import ArmyLogo from "../../feautures/home/ArmyLogo";

import { useStore } from "../../app/stores/store";
import { observer } from "mobx-react-lite";
import { NavLink } from "react-router-dom";




export default observer(function ManageRegistrationNavbar(){

    const {userStore} = useStore();
    const {logout, user} = userStore
  



    return(
        <div style={{backgroundColor: 'grey'}}>
        <Menu inverted color='grey'>
        <Menu.Item as={NavLink} to={'/'}>
          <ArmyLogo content={'REGISTRATION PORTAL'}  size="1.7em" textColor="#FFF" outerStarColor="yellow" innerStarColor="grey" />
        </Menu.Item>
        <Menu.Item
          name='Create New Registration' active
        />
               <Menu.Item position="right">
                    <Dropdown 
                        trigger={<><Icon name="user" /> {user?.displayName}</>} 
                        pointing="top right">
                        <Dropdown.Menu>
                            <Dropdown.Item icon="power" text="Logout" onClick={logout}/>
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu.Item>

      </Menu>
      </div>
    )
})