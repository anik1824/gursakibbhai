import React from 'react';
import { useSetting } from '../useSetting';
import { Button, Card, PageTitle, Spinner, Textarea } from '../ui';

export default function CustomCss() {
  const s = useSetting('css', { css: '' });
  if (s.loading) return <Spinner />;
  return (
    <div className="max-w-3xl space-y-4">
      <PageTitle title="কাস্টম CSS" subtitle="ওয়েবসাইটের ডিজাইনে নিজের মতো CSS যোগ করুন — শুধু পাবলিক সাইটে প্রয়োগ হবে, অ্যাডমিন প্যানেলে নয়" />
      <Card className="p-5 space-y-3">
        <Textarea
          rows={18}
          spellCheck={false}
          value={s.value.css}
          onChange={(e) => s.patch({ css: e.target.value })}
          className="font-mono text-xs"
          placeholder={'/* উদাহরণ */\nh1 { letter-spacing: -0.5px; }\n#order-form { scroll-margin-top: 80px; }'}
        />
        <Button loading={s.saving} onClick={() => s.save()}>
          সেভ করুন
        </Button>
      </Card>
    </div>
  );
}
