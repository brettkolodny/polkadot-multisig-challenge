import React, { useState } from "react";
import { Form, Input, Grid, Label, Icon, Button } from "semantic-ui-react";
import { TxButton } from "./substrate-lib/components";
import AccountSelector from "./AccountSelector";

export default function Main(props) {
  const [status, setStatus] = useState(null);
  const [formState, setFormState] = useState({ addressTo: null, amount: 0 });
  const [otherAddress, setOtherAddress] = useState(null);
  const [otherPair, setOtherPair] = useState(null);
  const { api, keyring } = props;

  const { from, sig1, sig2, to, amount } = formState;
  const sigs = [sig1, sig2].filter(addr => addr != null && addr != "null");
  const fromPair = from ? keyring.getPair(from) : null;

  // React.useEffect(() => {
  //   if (otherAddress) {
  //     setOtherPair(keyring.getPair(otherAddress));
  //     console.log("Test");
  //   }
  // }, [otherAddress]);

  const onChange = (_, data) =>
    setFormState((prev) => ({ ...prev, [data.state]: data.value }));

    // const sigs = [sig1, sig2, sig3].filter(addr => addr != null);

  const onClick = async () => {
    const { from, sig1, sig2, sig3, to, amount } = formState;

    const sigs = [sig1, sig2, sig3].filter((addr) => addr != null && addr != "null");
    console.log(sigs);

    // const sigs = [];

    const threshold = sigs.length;

    const pair = await keyring.getPair(from);

    const unsub = await api.tx.multisig.asMultiThreshold1(
      sigs,
      api.tx.balances.transfer(to, amount)
    ).signAndSend(pair, (result) => {
      if (result.status.isInBlock) {
        console.log("in block");
      } else if (result.status.isFinalized) {
        console.log("Finalized");
        unsub();
      }
    });

    // const unsub = await api.tx.multisig.asMulti(
    //   1,
    //   sigs,
    //   null,
    //   api.tx.balances.transfer(to, amount),
    //   false,
    //   100000000000
    // ).signAndSend(keyring.getPair(sigs[0]), ({ status, events, dispatchError }) => {
    //   // status would still be set, but in the case of error we can shortcut
    //   // to just check it (so an error would indicate InBlock or Finalized)
    //   if (dispatchError) {
    //     console.log("dispatch error");
    //     if (dispatchError.isModule) {
    //       // for module errors, we have the section indexed, lookup
    //       const decoded = api.registry.findMetaError(dispatchError.asModule);
    //       const { documentation, method, section } = decoded;
  
    //       console.log(`${section}.${method}: ${documentation.join(' ')}`);
    //     } else {
    //       // Other, CannotLookup, BadOrigin, no extra info
    //       console.log(dispatchError.toString());
    //     }

    //     unsub();
    //   } else {
    //     console.log(status);
    //   }
    // });

  };

  return (
    <Grid.Column width={8}>
      <h1>Multi Transfer</h1>
      <Form>
        <Form.Field>
          <Label basic color="teal">
            <Icon name="hand point right" />1 Unit = 1000000000000
          </Label>
        </Form.Field>
        <Form.Field>
          Transfer more than the existential amount for account with 0 balance
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label="From"
            type="text"
            placeholder="address"
            state="from"
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label="Signatory 1"
            type="text"
            placeholder="address"
            state="sig1"
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label="Signatory 2"
            type="text"
            placeholder="address"
            state="sig2"
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label="To"
            type="text"
            placeholder="address"
            state="to"
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label="Amount"
            type="number"
            state="amount"
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
        <TxButton
            accountPair={fromPair}
            label='Submit'
            type='SIGNED-TX'
            setStatus={setStatus}
            attrs={{
              palletRpc: 'multisig',
              callable: 'asMultiThreshold1',
              inputParams: [sigs, api.tx.balances.transfer(to, amount)],
              paramFields: [true, true]
            }}
          />
        </Form.Field>
        <div style={{ overflowWrap: "break-word" }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}
