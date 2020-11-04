import React, { useState } from "react";
import { Form, Input, Grid, Label, Icon, Button } from "semantic-ui-react";
import { TxButton } from "./substrate-lib/components";
import AccountSelector from "./AccountSelector";
import {
  createKeyMulti,
  encodeAddress,
  sortAddresses,
} from "@polkadot/util-crypto";
import keyring from "@polkadot/ui-keyring";

const SS58Prefix = 0;
const index = 0;

export default function Main(props) {
  const { setBalances, setAddresses, api } = props;
  const [formState, setFormState] = useState({
    address1: null,
    address2: null,
    address3: null,
    threshold: null,
  });

  const onChange = (_, data) => {
    setFormState((prev) => ({ ...prev, [data.state]: data.value }));
  };

  const createMultiAccount = async () => {
    const { address1, address2, address3, threshold, endowment } = formState;

    const addresses = [address1, address2, address3].filter(addr => addr != null);

    if (threshold == null || endowment == null) {
      return;
    }

    const multiAddress = createKeyMulti(addresses, threshold);

    // Convert byte array to SS58 encoding.
    const Ss58Address = encodeAddress(multiAddress, SS58Prefix);

    // console.log(`\nMultisig Address: ${Ss58Address}`);

    const pair = keyring.getPair(addresses[0]);

    const unsub = await api.tx.balances
    .transfer(Ss58Address, endowment)
    .signAndSend(pair, async (result) => {
      console.log(`Current status is ${result.status}`);
  
      if (result.status.isInBlock) {
        console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
      } else if (result.status.isFinalized) {
        console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
        setAddresses(prev => prev.concat(Ss58Address));
        let { data: blanance} = await api.query.system.account(Ss58Address);
        setBalances(prev => ({...prev, [Ss58Address]: blanance.free.toHuman()}));
        unsub();
      }
    });
    
  };

  return (
    <Grid.Column width={8}>
      <h1>Create Multisig Account</h1>
      <Form>
        <Form.Field>
            <Label basic color='teal'>
              <Icon name='hand point right' />
              1 Unit = 1000000000000
            </Label>
          </Form.Field>
        <Form.Field>Enter up to 3 addresses</Form.Field>
        <Form.Field>
          <Input
            fluid
            label="Addresses 1"
            state="address1"
            type="textarea"
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label="Addresses 2"
            state="address2"
            type="textarea"
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label="Addresses 3"
            state="address3"
            type="textarea"
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label="Threshold"
            state="threshold"
            type="number"
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label="Endowment"
            state="endowment"
            type="number"
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Button
            type="submit"
            className="ui blue basic button"
            onClick={createMultiAccount}
          >
            Create
          </Button>
        </Form.Field>
      </Form>
    </Grid.Column>
  );
}
