require 'tempfile'
require 'csv'

class ExportJob < ApplicationJob
  queue_as :default

  def perform(id, token)
    exportation = Exportation.find_by(token: token)
    records = LineItem.joins(:campaign).select('line_items.*, campaigns.name as campaign_name')

    Tempfile.create do |file|
      csv = CSV.new(
        file,
        headers: [:id, :name, :campaign_id, :campaign_name, :booked_amount, :actual_amount, :adjustments],
        write_headers: true
      )
      records.each do |record|
        csv << [
          record.id, record.name, record.campaign_id, record.campaign_name, record.booked_amount, record.actual_amount, record.adjustments
        ]
      end
      file.rewind
      exportation.file.attach(
        io: file, filename: "#{token}.csv", content_type: 'text/csv'
      )
    end

    exportation.status = 'finished'
    exportation.save!
  end
end
