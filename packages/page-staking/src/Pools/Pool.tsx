// Copyright 2017-2022 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { MembersMapEntry, Params } from './types';

import React, { useCallback } from 'react';
import styled from 'styled-components';

import { AddressMini, ExpandButton, ExpanderScroll } from '@polkadot/react-components';
import { useToggle } from '@polkadot/react-hooks';
import { FormatBalance } from '@polkadot/react-query';
import { formatNumber } from '@polkadot/util';

import { useTranslation } from '../translate';
import Join from './Join';
import usePoolInfo from './usePoolInfo';

interface Props {
  className?: string;
  members: MembersMapEntry[];
  ownAccounts?: string[];
  params: Params;
  poolId: BN;
}

function Pool ({ className = '', members, ownAccounts, params, poolId }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const info = usePoolInfo(poolId);
  const [isExpanded, toggleExpanded] = useToggle(false);

  const renderMembers = useCallback(
    () => members.map(({ accountId, member }, count) => (
      <AddressMini
        balance={member.points}
        key={`${count}:${accountId}`}
        value={accountId}
        withBalance
        withShrink
      />
    )),
    [members]
  );

  if (!info) {
    return null;
  }

  return (
    <>
      <tr className={`${className}${isExpanded ? ' noBorder' : ''}`}>
        <td className='number'><h1>{formatNumber(poolId)}</h1></td>
        <td className='start'>{info.metadata}</td>
        <td className='number'>{info.bonded.state.type}</td>
        <td className='number'><FormatBalance value={info.bonded.points} /></td>
        <td className='number media--1100'>{!info.rewardClaimable.isZero() && <FormatBalance value={info.rewardClaimable} />}</td>
        <td className='number'>
          {members && members.length !== 0 && (
            <ExpanderScroll
              empty={t<string>('No members')}
              renderChildren={renderMembers}
              summary={t<string>('Members ({{count}})', { replace: { count: members.length } })}
            />
          )}
        </td>
        <td className='button'>
          <Join
            isDisabled={!info.bonded.state.isOpen || !info.bonded.memberCounter.ltn(params.maxMembersPerPool)}
            ownAccounts={ownAccounts}
            params={params}
            poolId={poolId}
          />
          <ExpandButton
            expanded={isExpanded}
            onClick={toggleExpanded}
          />
        </td>
      </tr>
      <tr className={`${className} ${isExpanded ? 'isExpanded' : 'isCollapsed'}`}>
        <td colSpan={4}>
          <div className='label-column-right'>
            <div className='label'>{t('root')}</div>
            <div className='inline-balance'><AddressMini value={info.bonded.roles.root} /></div>
          </div>
          <div className='label-column-right'>
            <div className='label'>{t('creator')}</div>
            <div className='inline-balance'><AddressMini value={info.bonded.roles.depositor} /></div>
          </div>
          <div className='label-column-right'>
            <div className='label'>{t('nominator')}</div>
            <div className='inline-balance'><AddressMini value={info.bonded.roles.nominator} /></div>
          </div>
          <div className='label-column-right'>
            <div className='label'>{t('toggler')}</div>
            <div className='inline-balance'><AddressMini value={info.bonded.roles.stateToggler} /></div>
          </div>
        </td>
        <td className='number media--1100' />
        <td colSpan={2}>
          <div className='label-column-right'>
            <div className='label'>{t('stash')}</div>
            <div className='inline-balance'><AddressMini value={info.stashId} /></div>
          </div>
          <div className='label-column-right'>
            <div className='label'>{t('rewards')}</div>
            <div className='inline-balance'><AddressMini value={info.rewardId} /></div>
          </div>
        </td>
      </tr>
    </>
  );
}

export default React.memo(styled(Pool)`
  .label-column-right,
  .label-column-left{
    display: flex;
    align-items: center;

    .label {
      width: 50%;
    }
  }

  .label {
    text-align: right;
    padding: 0 1.7rem 0 0;
    line-height: normal;
    color: var(--color-label);
    text-transform: lowercase;
  }
`);
