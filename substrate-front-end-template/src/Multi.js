import React, { useState } from "react";
import MultiCreate from "./MultiCreate";
import MultiTransfer from "./MultiTransfer";
import { Grid, Table, Button } from "semantic-ui-react";
import { useSubstrate } from './substrate-lib';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default function Main(props) {
  const { api, keyring } = useSubstrate();
  const [addresses, setAddresses] = React.useState([]);
  const [balances, setBalances] = React.useState({});

  return (
    <Grid.Row>
      <Grid.Column width={16}>
        <h1>Multisig Accounts</h1>
        <Table celled striped size='small'>
          <Table.Body>{addresses.map(address =>
            <Table.Row key={address}>
              <Table.Cell width={10}>
                <span style={{ display: 'inline-block', minWidth: '31em' }}>
                  {address}
                </span>
                <CopyToClipboard text={address}>
                  <Button
                    basic
                    circular
                    compact
                    size='mini'
                    color='blue'
                    icon='copy outline'
                  />
                </CopyToClipboard>
              </Table.Cell>
              <Table.Cell width={3}>{
              balances && balances[address]
            }</Table.Cell>
            </Table.Row>
          )}
          </Table.Body>
        </Table>
      </Grid.Column>
      <MultiCreate setAddresses={setAddresses} setBalances={setBalances} api={api} />
      <MultiTransfer keyring={keyring} api={api} />
    </Grid.Row>
  );
}
